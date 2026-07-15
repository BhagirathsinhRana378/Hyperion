use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum TaskStatus {
    Pending,
    Queued,
    Dispatched,
    Acknowledged,
    Running,
    Streaming,
    Completed,
    Failed,
    Retrying,
    Cancelled,
}

impl TaskStatus {
    pub fn is_terminal(&self) -> bool {
        matches!(self, Self::Completed | Self::Failed | Self::Cancelled)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum OrchestrationStatus {
    Dispatching,
    Executing,
    WaitingReview,
    Iterating,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum TerminalState {
    Idle,
    Busy,
    Disconnected,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: String,
    pub terminal_id: String,
    pub workspace_id: String,
    pub request_id: String,
    pub command: String,
    pub status: TaskStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub retry_count: u32,
    pub max_retries: u32,
    pub timeout_ms: u64,
    pub output: Option<String>,
    pub error: Option<String>,
    pub exit_code: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskInput {
    pub terminal_id: String,
    pub command: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalInfo {
    pub id: String,
    pub workspace_id: String,
    pub state: TerminalState,
    pub last_heartbeat: u64,
    pub current_task_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationContext {
    pub request_id: String,
    pub workspace_id: String,
    pub plan: String,
    pub iteration: u32,
    pub max_iterations: u32,
    pub status: OrchestrationStatus,
    pub task_ids: Vec<String>,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskResult {
    pub task_id: String,
    pub terminal_id: String,
    pub command: String,
    pub status: TaskStatus,
    pub output: Option<String>,
    pub error: Option<String>,
    pub exit_code: Option<i32>,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationEvent {
    pub event_type: String,
    pub request_id: String,
    pub timestamp: u64,
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationStateResponse {
    pub request_id: String,
    pub status: OrchestrationStatus,
    pub iteration: u32,
    pub tasks: Vec<Task>,
    pub results: Vec<TaskResult>,
}

pub fn now_millis() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}
