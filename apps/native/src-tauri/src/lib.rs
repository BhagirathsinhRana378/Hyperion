mod terminal;
mod ai;

use serde::Serialize;

#[derive(Serialize)]
struct GreetResponse {
  message_key: String,
  name: String,
  source: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> GreetResponse {
  GreetResponse {
    message_key: "successGreeting".to_string(),
    name: name.to_string(),
    source: "Tauri".to_string(),
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_http::init())
    .invoke_handler(tauri::generate_handler![
      greet,
      terminal::create_terminal,
      terminal::write_terminal,
      terminal::resize_terminal,
      terminal::get_terminal_history,
      terminal::close_terminal,
      terminal::dispatch_task,
      terminal::ack_task,
      terminal::report_task_status,
      ai::call_llm_stream
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
