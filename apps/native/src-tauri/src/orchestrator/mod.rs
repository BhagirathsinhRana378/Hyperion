pub mod engine;
pub mod types;

use std::sync::{Arc, OnceLock};
use tokio::sync::RwLock;
use tauri::{AppHandle, Runtime};

use engine::OrchestratorEngine;
use types::*;

type EngineState = Arc<RwLock<OrchestratorEngine>>;

fn engine() -> &'static EngineState {
    static ENGINE: OnceLock<EngineState> = OnceLock::new();
    ENGINE.get_or_init(|| Arc::new(RwLock::new(OrchestratorEngine::new())))
}

#[tauri::command]
pub async fn start_orchestration<R: Runtime>(
    app: AppHandle<R>,
    request_id: String,
    workspace_id: String,
    plan: String,
    tasks: Vec<TaskInput>,
    max_iterations: u32,
) -> Result<OrchestrationStateResponse, String> {
    let eng = engine().clone();
    let task_list = {
        let mut e = eng.write().await;
        e.create_orchestration(request_id.clone(), workspace_id, plan, tasks, max_iterations)?
    };
    let task_ids: Vec<String> = task_list.iter().map(|t| t.id.clone()).collect();
    
    // Spawn the async dispatch loop
    let app_clone = app.clone();
    let eng_clone = eng.clone();
    let rid = request_id.clone();
    tokio::spawn(async move {
        engine::run_dispatch_loop(app_clone, eng_clone, rid, task_ids).await;
    });
    
    let e = eng.read().await;
    e.get_state(&request_id)
}

#[tauri::command]
pub async fn register_terminal(
    terminal_id: String,
    workspace_id: String,
) -> Result<(), String> {
    let mut e = engine().write().await;
    e.register_terminal(terminal_id, workspace_id);
    Ok(())
}

#[tauri::command]
pub async fn unregister_terminal(terminal_id: String) -> Result<(), String> {
    let mut e = engine().write().await;
    e.unregister_terminal(&terminal_id);
    Ok(())
}

#[tauri::command]
pub async fn terminal_heartbeat(terminal_id: String) -> Result<(), String> {
    let mut e = engine().write().await;
    e.update_heartbeat(&terminal_id)
}

#[tauri::command]
pub async fn task_acknowledged<R: Runtime>(
    app: AppHandle<R>,
    task_id: String,
    terminal_id: String,
) -> Result<(), String> {
    let mut e = engine().write().await;
    e.handle_task_ack(&task_id, &terminal_id)?;
    // Emit event for frontend UI update
    engine::emit_orchestration_event(&app, "", "task_acknowledged", serde_json::json!({
        "taskId": task_id,
        "terminalId": terminal_id
    }));
    Ok(())
}

#[tauri::command]
pub async fn task_status_update<R: Runtime>(
    app: AppHandle<R>,
    task_id: String,
    status: String,
    output: Option<String>,
    error: Option<String>,
    exit_code: Option<i32>,
) -> Result<(), String> {
    let completed_request_id = {
        let mut e = engine().write().await;
        e.handle_task_status(&task_id, &status, output.clone(), error.clone(), exit_code)?
    };
    
    // Emit task status event
    engine::emit_orchestration_event(&app, "", &format!("task_{}", status.to_lowercase()), serde_json::json!({
        "taskId": task_id,
        "status": status,
        "output": output,
        "error": error,
        "exitCode": exit_code
    }));
    
    // If a request just completed all tasks, notification has been fired inside handle_task_status
    if let Some(_rid) = completed_request_id {
        // Waiters notified
    }
    
    Ok(())
}

#[tauri::command]
pub async fn cancel_orchestration<R: Runtime>(
    app: AppHandle<R>,
    request_id: String,
) -> Result<(), String> {
    let mut e = engine().write().await;
    e.cancel_orchestration(&request_id)?;
    engine::emit_orchestration_event(&app, &request_id, "orchestration_cancelled", serde_json::json!({}));
    Ok(())
}

#[tauri::command]
pub async fn add_iteration<R: Runtime>(
    app: AppHandle<R>,
    request_id: String,
    tasks: Vec<TaskInput>,
) -> Result<OrchestrationStateResponse, String> {
    let eng = engine().clone();
    let new_tasks = {
        let mut e = eng.write().await;
        e.add_iteration(&request_id, tasks)?
    };
    let task_ids: Vec<String> = new_tasks.iter().map(|t| t.id.clone()).collect();
    
    // Spawn new dispatch loop for the new tasks
    let app_clone = app.clone();
    let eng_clone = eng.clone();
    let rid = request_id.clone();
    tokio::spawn(async move {
        engine::run_dispatch_loop(app_clone, eng_clone, rid, task_ids).await;
    });
    
    let e = eng.read().await;
    e.get_state(&request_id)
}

#[tauri::command]
pub async fn get_orchestration_state(
    request_id: String,
) -> Result<OrchestrationStateResponse, String> {
    let e = engine().read().await;
    e.get_state(&request_id)
}
