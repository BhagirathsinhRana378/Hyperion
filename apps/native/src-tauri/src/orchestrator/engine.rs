use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{oneshot, Notify, RwLock};
use tauri::{AppHandle, Emitter, Runtime};
use uuid::Uuid;
use super::types::*;

pub struct OrchestratorEngine {
    pub contexts: HashMap<String, OrchestrationContext>,
    pub tasks: HashMap<String, Task>,
    pub terminals: HashMap<String, TerminalInfo>,
    ack_senders: HashMap<String, oneshot::Sender<()>>,
    completion_notify: Arc<Notify>,
}

impl OrchestratorEngine {
    pub fn new() -> Self {
        Self {
            contexts: HashMap::new(),
            tasks: HashMap::new(),
            terminals: HashMap::new(),
            ack_senders: HashMap::new(),
            completion_notify: Arc::new(Notify::new()),
        }
    }

    pub fn register_terminal(&mut self, terminal_id: String, workspace_id: String) {
        let term = TerminalInfo {
            id: terminal_id.clone(),
            workspace_id,
            state: TerminalState::Idle,
            last_heartbeat: now_millis(),
            current_task_id: None,
        };
        self.terminals.insert(terminal_id, term);
    }

    pub fn unregister_terminal(&mut self, terminal_id: &str) {
        self.terminals.remove(terminal_id);
    }

    pub fn update_heartbeat(&mut self, terminal_id: &str) -> Result<(), String> {
        if let Some(term) = self.terminals.get_mut(terminal_id) {
            term.last_heartbeat = now_millis();
            Ok(())
        } else {
            Err("Terminal not registered".to_string())
        }
    }

    pub fn create_orchestration(
        &mut self,
        request_id: String,
        workspace_id: String,
        plan: String,
        task_inputs: Vec<TaskInput>,
        max_iterations: u32,
    ) -> Result<Vec<Task>, String> {
        let now = now_millis();
        let mut created_tasks = Vec::new();
        let mut task_ids = Vec::new();

        for input in task_inputs {
            let task_id = format!("task-{}", Uuid::new_v4().to_string()[..8].to_string());
            let task = Task {
                id: task_id.clone(),
                terminal_id: input.terminal_id,
                workspace_id: workspace_id.clone(),
                request_id: request_id.clone(),
                command: input.command,
                status: TaskStatus::Pending,
                created_at: now,
                updated_at: now,
                retry_count: 0,
                max_retries: 3,
                timeout_ms: 3000,
                output: None,
                error: None,
                exit_code: None,
            };
            self.tasks.insert(task_id.clone(), task.clone());
            created_tasks.push(task);
            task_ids.push(task_id);
        }

        let context = OrchestrationContext {
            request_id: request_id.clone(),
            workspace_id,
            plan,
            iteration: 1,
            max_iterations,
            status: OrchestrationStatus::Dispatching,
            task_ids,
            created_at: now,
            updated_at: now,
        };

        self.contexts.insert(request_id, context);
        Ok(created_tasks)
    }

    pub fn handle_task_ack(&mut self, task_id: &str, terminal_id: &str) -> Result<(), String> {
        let task = self.tasks.get_mut(task_id).ok_or_else(|| "Task not found".to_string())?;
        if task.terminal_id != terminal_id {
            return Err("Terminal ID mismatch".to_string());
        }

        task.status = TaskStatus::Acknowledged;
        task.updated_at = now_millis();

        if let Some(term) = self.terminals.get_mut(terminal_id) {
            term.state = TerminalState::Busy;
            term.current_task_id = Some(task_id.to_string());
        }

        if let Some(sender) = self.ack_senders.remove(task_id) {
            let _ = sender.send(());
        }

        Ok(())
    }

    pub fn handle_task_status(
        &mut self,
        task_id: &str,
        status: &str,
        output: Option<String>,
        error: Option<String>,
        exit_code: Option<i32>,
    ) -> Result<Option<String>, String> {
        let task = self.tasks.get_mut(task_id).ok_or_else(|| "Task not found".to_string())?;

        let parsed_status = match status.to_lowercase().as_str() {
            "queued" => TaskStatus::Queued,
            "dispatched" => TaskStatus::Dispatched,
            "acknowledged" => TaskStatus::Acknowledged,
            "running" => TaskStatus::Running,
            "streaming" => TaskStatus::Streaming,
            "completed" => TaskStatus::Completed,
            "failed" => TaskStatus::Failed,
            "retrying" | "retry" => TaskStatus::Retrying,
            "cancelled" => TaskStatus::Cancelled,
            _ => return Err(format!("Unknown task status: {}", status)),
        };

        task.status = parsed_status.clone();
        task.updated_at = now_millis();

        if let Some(out) = output {
            task.output = Some(format!("{}{}", task.output.as_deref().unwrap_or(""), out));
        }
        if error.is_some() {
            task.error = error;
        }
        if exit_code.is_some() {
            task.exit_code = exit_code;
        }

        if parsed_status.is_terminal() {
            if let Some(term) = self.terminals.get_mut(&task.terminal_id) {
                term.state = TerminalState::Idle;
                term.current_task_id = None;
            }
        }

        let request_id = task.request_id.clone();
        
        let all_terminal = if let Some(ctx) = self.contexts.get(&request_id) {
            ctx.task_ids.iter().all(|tid| {
                self.tasks.get(tid).map_or(true, |t| t.status.is_terminal())
            })
        } else {
            false
        };

        if all_terminal {
            if let Some(ctx) = self.contexts.get_mut(&request_id) {
                ctx.status = OrchestrationStatus::WaitingReview;
                ctx.updated_at = now_millis();
            }
            self.completion_notify.notify_waiters();
            Ok(Some(request_id))
        } else {
            Ok(None)
        }
    }

    pub fn register_ack_channel(&mut self, task_id: String) -> oneshot::Receiver<()> {
        let (tx, rx) = oneshot::channel();
        self.ack_senders.insert(task_id, tx);
        rx
    }

    pub fn completion_notify(&self) -> Arc<Notify> {
        self.completion_notify.clone()
    }

    pub fn get_task(&self, task_id: &str) -> Option<Task> {
        self.tasks.get(task_id).cloned()
    }

    pub fn mark_task_retrying(&mut self, task_id: &str) -> Result<(), String> {
        let task = self.tasks.get_mut(task_id).ok_or_else(|| "Task not found".to_string())?;
        task.status = TaskStatus::Retrying;
        task.retry_count += 1;
        task.updated_at = now_millis();
        Ok(())
    }

    pub fn mark_task_failed(&mut self, task_id: &str, error: String) -> Result<(), String> {
        let task = self.tasks.get_mut(task_id).ok_or_else(|| "Task not found".to_string())?;
        task.status = TaskStatus::Failed;
        task.error = Some(error);
        task.updated_at = now_millis();

        if let Some(term) = self.terminals.get_mut(&task.terminal_id) {
            term.state = TerminalState::Idle;
            term.current_task_id = None;
        }

        let request_id = task.request_id.clone();
        let all_terminal = if let Some(ctx) = self.contexts.get(&request_id) {
            ctx.task_ids.iter().all(|tid| {
                self.tasks.get(tid).map_or(true, |t| t.status.is_terminal())
            })
        } else {
            false
        };

        if all_terminal {
            if let Some(ctx) = self.contexts.get_mut(&request_id) {
                ctx.status = OrchestrationStatus::WaitingReview;
                ctx.updated_at = now_millis();
            }
            self.completion_notify.notify_waiters();
        }

        Ok(())
    }

    pub fn add_iteration(
        &mut self,
        request_id: &str,
        task_inputs: Vec<TaskInput>,
    ) -> Result<Vec<Task>, String> {
        let now = now_millis();
        let ctx = self.contexts.get_mut(request_id).ok_or_else(|| "Context not found".to_string())?;
        ctx.iteration += 1;
        ctx.status = OrchestrationStatus::Dispatching;
        ctx.updated_at = now;

        let mut created_tasks = Vec::new();
        for input in task_inputs {
            let task_id = format!("task-{}", Uuid::new_v4().to_string()[..8].to_string());
            let task = Task {
                id: task_id.clone(),
                terminal_id: input.terminal_id,
                workspace_id: ctx.workspace_id.clone(),
                request_id: request_id.to_string(),
                command: input.command,
                status: TaskStatus::Pending,
                created_at: now,
                updated_at: now,
                retry_count: 0,
                max_retries: 3,
                timeout_ms: 3000,
                output: None,
                error: None,
                exit_code: None,
            };
            self.tasks.insert(task_id.clone(), task.clone());
            ctx.task_ids.push(task_id);
            created_tasks.push(task);
        }

        Ok(created_tasks)
    }

    pub fn cancel_orchestration(&mut self, request_id: &str) -> Result<(), String> {
        let ctx = self.contexts.get_mut(request_id).ok_or_else(|| "Context not found".to_string())?;
        ctx.status = OrchestrationStatus::Cancelled;
        ctx.updated_at = now_millis();

        for tid in &ctx.task_ids {
            if let Some(t) = self.tasks.get_mut(tid) {
                if !t.status.is_terminal() {
                    t.status = TaskStatus::Cancelled;
                    t.updated_at = now_millis();
                    if let Some(term) = self.terminals.get_mut(&t.terminal_id) {
                        term.state = TerminalState::Idle;
                        term.current_task_id = None;
                    }
                }
            }
        }
        self.completion_notify.notify_waiters();
        Ok(())
    }

    pub fn get_state(&self, request_id: &str) -> Result<OrchestrationStateResponse, String> {
        let ctx = self.contexts.get(request_id).ok_or_else(|| "Context not found".to_string())?;
        let mut tasks = Vec::new();
        for tid in &ctx.task_ids {
            if let Some(t) = self.tasks.get(tid) {
                tasks.push(t.clone());
            }
        }

        let results = self.get_results(request_id)?;

        Ok(OrchestrationStateResponse {
            request_id: request_id.to_string(),
            status: ctx.status.clone(),
            iteration: ctx.iteration,
            tasks,
            results,
        })
    }

    pub fn get_results(&self, request_id: &str) -> Result<Vec<TaskResult>, String> {
        let ctx = self.contexts.get(request_id).ok_or_else(|| "Context not found".to_string())?;
        let mut results = Vec::new();
        for tid in &ctx.task_ids {
            if let Some(t) = self.tasks.get(tid) {
                let duration = if t.updated_at >= t.created_at {
                    t.updated_at - t.created_at
                } else {
                    0
                };
                results.push(TaskResult {
                    task_id: t.id.clone(),
                    terminal_id: t.terminal_id.clone(),
                    command: t.command.clone(),
                    status: t.status.clone(),
                    output: t.output.clone(),
                    error: t.error.clone(),
                    exit_code: t.exit_code,
                    duration_ms: duration,
                });
            }
        }
        Ok(results)
    }
}

pub async fn run_dispatch_loop<R: Runtime>(
    app: AppHandle<R>,
    engine: Arc<RwLock<OrchestratorEngine>>,
    request_id: String,
    task_ids: Vec<String>,
) {
    println!("[ORCHESTRATOR] Starting dispatch loop for request {}", request_id);

    let mut join_handles = vec![];
    for task_id in task_ids.clone() {
        let app_clone = app.clone();
        let engine_clone = engine.clone();
        let rid = request_id.clone();

        let handle = tokio::spawn(async move {
            for attempt in 0..3u32 {
                let ack_rx = {
                    let mut eng = engine_clone.write().await;
                    eng.register_ack_channel(task_id.clone())
                };

                let task_opt = {
                    let eng = engine_clone.read().await;
                    eng.get_task(&task_id)
                };

                let task = match task_opt {
                    Some(t) => t,
                    None => return,
                };

                let event_name = format!("dispatch-task-{}", task.terminal_id);
                if let Err(e) = app_clone.emit(&event_name, &task) {
                    println!("[ORCHESTRATOR] Failed to emit dispatch event: {}", e);
                }

                emit_orchestration_event(&app_clone, &rid, "task_dispatched", serde_json::json!({
                    "taskId": task_id,
                    "terminalId": task.terminal_id,
                    "command": task.command,
                    "attempt": attempt + 1
                }));

                let ack_result = tokio::time::timeout(
                    std::time::Duration::from_secs(3),
                    ack_rx
                ).await;

                match ack_result {
                    Ok(Ok(())) => {
                        println!("[ORCHESTRATOR] Task {} acknowledged (attempt {})", task_id, attempt + 1);
                        emit_orchestration_event(&app_clone, &rid, "task_acknowledged", serde_json::json!({
                            "taskId": task_id,
                            "terminalId": task.terminal_id
                        }));
                        return;
                    }
                    _ => {
                        println!("[ORCHESTRATOR] ACK timeout or error for task {} (attempt {})", task_id, attempt + 1);
                        if attempt < 2 {
                            let mut eng = engine_clone.write().await;
                            let _ = eng.mark_task_retrying(&task_id);
                            emit_orchestration_event(&app_clone, &rid, "task_retrying", serde_json::json!({
                                "taskId": task_id,
                                "attempt": attempt + 2
                            }));
                            tokio::time::sleep(std::time::Duration::from_millis(500)).await;
                        } else {
                            let mut eng = engine_clone.write().await;
                            let _ = eng.mark_task_failed(&task_id, "ACK timeout after 3 attempts".to_string());
                            emit_orchestration_event(&app_clone, &rid, "task_failed", serde_json::json!({
                                "taskId": task_id,
                                "error": "ACK timeout after 3 attempts"
                            }));
                        }
                    }
                }
            }
        });
        join_handles.push(handle);
    }

    for handle in join_handles {
        let _ = handle.await;
    }

    {
        let mut eng = engine.write().await;
        if let Some(ctx) = eng.contexts.get_mut(&request_id) {
            ctx.status = OrchestrationStatus::Executing;
            ctx.updated_at = now_millis();
        }
    }

    emit_orchestration_event(&app, &request_id, "dispatching_complete", serde_json::json!({
        "message": "All tasks dispatched, waiting for execution results"
    }));

    loop {
        let notify = {
            let eng = engine.read().await;
            eng.completion_notify()
        };

        let wait_result = tokio::time::timeout(
            std::time::Duration::from_secs(60),
            notify.notified()
        ).await;

        let all_done = {
            let eng = engine.read().await;
            if let Some(ctx) = eng.contexts.get(&request_id) {
                ctx.task_ids.iter().all(|tid| {
                    eng.tasks.get(tid).map_or(true, |t| t.status.is_terminal())
                })
            } else {
                true
            }
        };

        if all_done {
            println!("[ORCHESTRATOR] All tasks complete for request {}", request_id);

            let results = {
                let eng = engine.read().await;
                eng.get_results(&request_id).unwrap_or_default()
            };

            emit_orchestration_event(&app, &request_id, "iteration_complete", serde_json::json!({
                "results": results
            }));
            break;
        }

        if wait_result.is_err() {
            println!("[ORCHESTRATOR] Execution timeout for request {}", request_id);
            let mut eng = engine.write().await;
            if let Some(ctx) = eng.contexts.get_mut(&request_id) {
                ctx.status = OrchestrationStatus::Failed;
            }
            emit_orchestration_event(&app, &request_id, "orchestration_failed", serde_json::json!({
                "error": "Execution timed out after 60 seconds"
            }));
            break;
        }
    }
}

pub fn emit_orchestration_event<R: Runtime>(
    app: &AppHandle<R>,
    request_id: &str,
    event_type: &str,
    data: serde_json::Value,
) {
    let event = OrchestrationEvent {
        event_type: event_type.to_string(),
        request_id: request_id.to_string(),
        timestamp: now_millis(),
        data,
    };
    let _ = app.emit("orchestration-event", &event);
}
