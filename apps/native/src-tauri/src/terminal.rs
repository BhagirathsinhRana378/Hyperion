use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem, MasterPty};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex, OnceLock};
use std::thread;
use tauri::{Emitter, Runtime};

pub struct TerminalHistory {
    pub bytes: Vec<u8>,
    pub total_read: usize,
}

pub struct TerminalSession {
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    history: Arc<Mutex<TerminalHistory>>,
    child: Arc<Mutex<Box<dyn portable_pty::Child + Send>>>,
}

impl Drop for TerminalSession {
    fn drop(&mut self) {
        if let Ok(mut child) = self.child.lock() {
            let _ = child.kill();
        }
    }
}

type SessionMap = Arc<Mutex<HashMap<String, TerminalSession>>>;

fn sessions() -> &'static SessionMap {
    static SESSIONS: OnceLock<SessionMap> = OnceLock::new();
    SESSIONS.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

const MAX_HISTORY_BYTES: usize = 100_000;

#[derive(Clone, serde::Serialize)]
pub struct TerminalEventPayload {
    pub offset: usize,
    pub data: String,
}

#[derive(serde::Serialize)]
pub struct TerminalHistoryInfo {
    pub history: String,
    pub total_read: usize,
}

#[tauri::command]
pub fn create_terminal<R: Runtime>(
    app: tauri::AppHandle<R>,
    id: String,
    cols: u16,
    rows: u16,
    cwd: Option<String>,
) -> Result<bool, String> {
    let mut sessions_guard = sessions().lock().map_err(|e| e.to_string())?;

    let mut cols = cols;
    let mut rows = rows;
    if cols == 0 {
        cols = 80;
    }
    if rows == 0 {
        rows = 24;
    }

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
        return Ok(false); // Reused
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

    let mut cmd = CommandBuilder::new_default_prog();
    if let Some(ref path) = cwd {
        if !path.trim().is_empty() {
            cmd.cwd(path);
        }
    }

    let child = pair.slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    // Drop the slave side to avoid holding resources open in this process
    drop(pair.slave);

    let writer = pair.master.take_writer().map_err(|e| e.to_string())?;
    let reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;

    let history = Arc::new(Mutex::new(TerminalHistory {
        bytes: Vec::new(),
        total_read: 0,
    }));
    let shared_history = Arc::clone(&history);
    let session_id = id.clone();
    let app_handle = app.clone();

    // Spawn stdout/stderr reader thread
    thread::spawn(move || {
        let mut buf = [0u8; 4096];
        let mut reader = reader;
        loop {
            match reader.read(&mut buf) {
                Ok(n) if n > 0 => {
                    let data = &buf[..n];
                    
                    if let Ok(mut hist) = shared_history.lock() {
                        let offset = hist.total_read;
                        hist.bytes.extend_from_slice(data);
                        hist.total_read += n;
                        if hist.bytes.len() > MAX_HISTORY_BYTES {
                            let drain_amt = hist.bytes.len() - MAX_HISTORY_BYTES;
                            hist.bytes.drain(0..drain_amt);
                        }

                        // Emit event to frontend with offset
                        let text = String::from_utf8_lossy(data).to_string();
                        let payload = TerminalEventPayload {
                            offset,
                            data: text,
                        };
                        let event_name = format!("terminal-stdout-{}", session_id);
                        let _ = app_handle.emit(&event_name, payload);
                    }
                }
                _ => {
                    // Shell exited or error reading
                    break;
                }
            }
        }

        // Clean up session automatically when the reader thread finishes
        if let Ok(mut sessions_guard) = sessions().lock() {
            sessions_guard.remove(&session_id);
        }
    });

    let session = TerminalSession {
        writer: Arc::new(Mutex::new(writer)),
        master: Arc::new(Mutex::new(pair.master)),
        history,
        child: Arc::new(Mutex::new(child)),
    };

    sessions_guard.insert(id, session);
    Ok(true) // New session
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
    if cols == 0 || rows == 0 {
        return Ok(()); // Ignore invalid resize events to avoid conhost freezes
    }
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
pub fn get_terminal_history(id: String) -> Result<TerminalHistoryInfo, String> {
    let sessions_guard = sessions().lock().map_err(|e| e.to_string())?;
    if let Some(session) = sessions_guard.get(&id) {
        let history = session.history.lock().map_err(|e| e.to_string())?;
        Ok(TerminalHistoryInfo {
            history: String::from_utf8_lossy(&history.bytes).to_string(),
            total_read: history.total_read,
        })
    } else {
        Err("Terminal session not found".to_string())
    }
}

#[tauri::command]
pub fn close_terminal(id: String) -> Result<(), String> {
    let mut sessions_guard = sessions().lock().map_err(|e| e.to_string())?;
    if sessions_guard.remove(&id).is_some() {
        // Drop implementation handles process killing
        Ok(())
    } else {
        Err("Terminal session not found".to_string())
    }
}

