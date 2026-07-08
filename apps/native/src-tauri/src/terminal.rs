use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem, MasterPty};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex, OnceLock};
use std::thread;
use tauri::{Emitter, Window, Runtime};

pub struct TerminalSession {
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    history: Arc<Mutex<Vec<u8>>>,
    child: Arc<Mutex<Box<dyn portable_pty::Child + Send>>>,
}

type SessionMap = Arc<Mutex<HashMap<String, TerminalSession>>>;

fn sessions() -> &'static SessionMap {
    static SESSIONS: OnceLock<SessionMap> = OnceLock::new();
    SESSIONS.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

const MAX_HISTORY_BYTES: usize = 100_000;

#[tauri::command]
pub fn create_terminal<R: Runtime>(window: Window<R>, id: String, cols: u16, rows: u16) -> Result<(), String> {
    let mut sessions_guard = sessions().lock().map_err(|e| e.to_string())?;
    
    if sessions_guard.contains_key(&id) {
        // Re-use existing session, just trigger a resize to be sure
        if let Some(session) = sessions_guard.get(&id) {
            if let Ok(master) = session.master.lock() {
                let _ = master.resize(PtySize {
                    rows,
                    cols,
                    pixel_width: 0,
                    pixel_height: 0,
                });
            }
        }
        return Ok(());
    }

    let pty_system = NativePtySystem::default();
    let pair = pty_system
        .openpty(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    let cmd = CommandBuilder::new_default_prog();
    let child = pair.slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    // Drop the slave side to avoid holding resources open in this process
    drop(pair.slave);

    let writer = pair.master.take_writer().map_err(|e| e.to_string())?;
    let reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;

    let history = Arc::new(Mutex::new(Vec::new()));
    let shared_history = Arc::clone(&history);
    let session_id = id.clone();

    // Spawn stdout/stderr reader thread
    thread::spawn(move || {
        let mut buf = [0u8; 4096];
        let mut reader = reader;
        loop {
            match reader.read(&mut buf) {
                Ok(n) if n > 0 => {
                    let data = &buf[..n];
                    
                    // Save to history
                    if let Ok(mut hist) = shared_history.lock() {
                        hist.extend_from_slice(data);
                        if hist.len() > MAX_HISTORY_BYTES {
                            let drain_amt = hist.len() - MAX_HISTORY_BYTES;
                            hist.drain(0..drain_amt);
                        }
                    }

                    // Emit event to frontend
                    let text = String::from_utf8_lossy(data).to_string();
                    let event_name = format!("terminal-stdout-{}", session_id);
                    if let Err(e) = window.emit(&event_name, text) {
                        eprintln!("Error emitting terminal event: {:?}", e);
                        break;
                    }
                }
                _ => {
                    // Shell exited or error reading
                    break;
                }
            }
        }
    });

    let session = TerminalSession {
        writer: Arc::new(Mutex::new(writer)),
        master: Arc::new(Mutex::new(pair.master)),
        history,
        child: Arc::new(Mutex::new(child)),
    };

    sessions_guard.insert(id, session);
    Ok(())
}

#[tauri::command]
pub fn write_terminal(id: String, data: String) -> Result<(), String> {
    let sessions_guard = sessions().lock().map_err(|e| e.to_string())?;
    if let Some(session) = sessions_guard.get(&id) {
        let mut writer = session.writer.lock().map_err(|e| e.to_string())?;
        writer
            .write_all(data.as_bytes())
            .map_err(|e| format!("Failed to write to terminal: {}", e))?;
        writer.flush().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Terminal session not found".to_string())
    }
}

#[tauri::command]
pub fn resize_terminal(id: String, cols: u16, rows: u16) -> Result<(), String> {
    let sessions_guard = sessions().lock().map_err(|e| e.to_string())?;
    if let Some(session) = sessions_guard.get(&id) {
        let master = session.master.lock().map_err(|e| e.to_string())?;
        master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to resize PTY: {}", e))?;
        Ok(())
    } else {
        Err("Terminal session not found".to_string())
    }
}

#[tauri::command]
pub fn get_terminal_history(id: String) -> Result<String, String> {
    let sessions_guard = sessions().lock().map_err(|e| e.to_string())?;
    if let Some(session) = sessions_guard.get(&id) {
        let history = session.history.lock().map_err(|e| e.to_string())?;
        Ok(String::from_utf8_lossy(&history).to_string())
    } else {
        Err("Terminal session not found".to_string())
    }
}

#[tauri::command]
pub fn close_terminal(id: String) -> Result<(), String> {
    let mut sessions_guard = sessions().lock().map_err(|e| e.to_string())?;
    if let Some(session) = sessions_guard.remove(&id) {
        if let Ok(mut child) = session.child.lock() {
            let _ = child.kill();
        }
        Ok(())
    } else {
        Err("Terminal session not found".to_string())
    }
}
