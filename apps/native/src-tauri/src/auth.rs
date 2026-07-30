use axum::{extract::Query, response::Html, routing::get, Router};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthSession {
    pub session_id: String,
    pub user_id: String,
    pub email: String,
    pub name: Option<String>,
    pub avatar: Option<String>,
}

#[tauri::command]
pub async fn save_session(app: AppHandle, session: AuthSession) -> Result<(), String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    let path = data_dir.join("auth_session.json");
    let content = serde_json::to_string(&session).map_err(|e| e.to_string())?;
    std::fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_session(app: AppHandle) -> Result<Option<AuthSession>, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let path = data_dir.join("auth_session.json");
    if path.exists() {
        let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let session: AuthSession = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        Ok(Some(session))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn clear_session(app: AppHandle) -> Result<(), String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let path = data_dir.join("auth_session.json");
    if path.exists() {
        let _ = std::fs::remove_file(path);
    }
    Ok(())
}

#[tauri::command]
pub fn open_browser(app: AppHandle, url: String) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    if let Err(e) = app.opener().open_url(&url, None::<&str>) {
        eprintln!("Tauri opener plugin failed, attempting OS fallback: {}", e);
        #[cfg(target_os = "windows")]
        std::process::Command::new("cmd").args(["/C", "start", &url]).spawn().ok();

        #[cfg(target_os = "macos")]
        std::process::Command::new("open").arg(&url).spawn().ok();

        #[cfg(target_os = "linux")]
        std::process::Command::new("xdg-open").arg(&url).spawn().ok();
    }
    Ok(())
}

pub fn start_auth_listener(app_handle: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let addr = SocketAddr::from(([127, 0, 0, 1], 8787));
        let fallback_addr = SocketAddr::from(([127, 0, 0, 1], 8788));

        let handle = Arc::new(app_handle);
        let app = Router::new().route(
            "/auth/callback",
            get({
                let handle = handle.clone();
                move |Query(params): Query<HashMap<String, String>>| {
                    let handle = handle.clone();
                    async move {
                        if let (Some(session_id), Some(user_id)) =
                            (params.get("session_id"), params.get("user_id"))
                        {
                            let email = params
                                .get("email")
                                .cloned()
                                .unwrap_or_else(|| user_id.clone());
                            let name = params.get("name").cloned();
                            let avatar = params.get("avatar").cloned();

                            let session_obj = AuthSession {
                                session_id: session_id.clone(),
                                user_id: user_id.clone(),
                                email: email.clone(),
                                name: name.clone(),
                                avatar: avatar.clone(),
                            };

                            // Save session directly to disk in Rust
                            if let Ok(data_dir) = handle.path().app_data_dir() {
                                std::fs::create_dir_all(&data_dir).ok();
                                let path = data_dir.join("auth_session.json");
                                if let Ok(content) = serde_json::to_string(&session_obj) {
                                    std::fs::write(path, content).ok();
                                }
                            }

                            handle.emit("auth-success", &session_obj).ok();
                        }

                        Html(r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hyperion Auth</title>
    <style>
        body { margin: 0; padding: 0; background-color: #09090b; color: #f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; }
        .container { background-color: #18181b; border: 1px solid #27272a; padding: 2.5rem; border-radius: 1rem; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); max-width: 380px; width: 100%; }
        .icon { width: 3.5rem; height: 3.5rem; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto; color: #22c55e; }
        h1 { margin: 0 0 0.5rem 0; font-size: 1.35rem; font-weight: 700; color: #ffffff; }
        p { color: #a1a1aa; font-size: 0.875rem; margin: 0; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
            </svg>
        </div>
        <h1>Authentication Successful</h1>
        <p>Your session has been securely transferred. You can close this window and return to Hyperion.</p>
    </div>
    <script>setTimeout(() => { window.close(); }, 3000);</script>
</body>
</html>"#)
                    }
                }
            }),
        );

        let listener = match tokio::net::TcpListener::bind(addr).await {
            Ok(l) => l,
            Err(_) => match tokio::net::TcpListener::bind(fallback_addr).await {
                Ok(l) => l,
                Err(e) => {
                    eprintln!("Failed to bind auth listener on 8787/8788: {}", e);
                    return;
                }
            },
        };

        println!(
            "Hyperion auth callback listener running on port {}",
            listener.local_addr().unwrap().port()
        );
        axum::serve(listener, app).await.unwrap();
    });
}
