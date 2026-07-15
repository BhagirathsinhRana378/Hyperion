use serde::{Deserialize, Serialize};
use std::env;
use futures_util::StreamExt;
use tauri::Emitter;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LlmPayload {
    pub provider: String,
    pub api_key: String,
    pub base_url: String,
    pub model: String,
    pub messages: Vec<serde_json::Value>,
}

fn combine_url(base: &str, path: &str) -> String {
    let clean_base = base.trim().trim_end_matches('/');
    let clean_path = path.trim().trim_start_matches('/');
    format!("{}/{}", clean_base, clean_path)
}

#[tauri::command]
pub async fn call_llm_stream(
    window: tauri::Window,
    payload: LlmPayload,
) -> Result<String, String> {
    // 1. Determine active key and load from env if empty
    let api_key = if payload.api_key.trim().is_empty() {
        env::var("GEMINI_API_KEY").map_err(|_| {
            "API Key is missing and GEMINI_API_KEY environment variable is not set.".to_string()
        })?
    } else {
        payload.api_key
    };

    println!("[RUST BACKEND] call_llm_stream invoked.");
    println!("[RUST BACKEND] Provider: {}", payload.provider);
    println!("[RUST BACKEND] Model: {}", payload.model);
    println!("[RUST BACKEND] Base URL: {}", payload.base_url);

    // 2. Setup Client
    let client = reqwest::Client::new();
    let mut full_content = String::new();

    if payload.provider.to_lowercase() == "anthropic" {
        // Anthropic direct request
        let url = combine_url(&payload.base_url, "messages");
        println!("[RUST BACKEND] Posting direct Anthropic to URL: {}", url);

        // Convert messages to Anthropic layout
        let mut converted_messages = Vec::new();
        let mut system_prompt = String::new();

        for m in payload.messages {
            if let Some(role) = m.get("role").and_then(|r| r.as_str()) {
                if role == "system" {
                    if let Some(content) = m.get("content").and_then(|c| c.as_str()) {
                        system_prompt.push_str(content);
                    }
                } else {
                    converted_messages.push(m.clone());
                }
            }
        }

        let mut body_map = serde_json::Map::new();
        body_map.insert("model".to_string(), serde_json::Value::String(payload.model));
        if !system_prompt.is_empty() {
            body_map.insert("system".to_string(), serde_json::Value::String(system_prompt));
        }
        body_map.insert("messages".to_string(), serde_json::Value::Array(converted_messages));
        body_map.insert("max_tokens".to_string(), serde_json::Value::Number(serde_json::Number::from(4000)));
        body_map.insert("stream".to_string(), serde_json::Value::Bool(true));

        let res = client
            .post(&url)
            .header("x-api-key", &api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .header("dangerously-allow-developer-user-access", "true")
            .json(&serde_json::Value::Object(body_map))
            .send()
            .await
            .map_err(|e| format!("Anthropic request failed: {}", e))?;

        let status = res.status();
        println!("[RUST BACKEND] Anthropic Response Status: {}", status);

        if !status.is_success() {
            let error_text = res.text().await.unwrap_or_default();
            println!("[RUST BACKEND] Anthropic Error Body: {}", error_text);
            return Err(format!("Anthropic API returned error {}: {}", status, error_text));
        }

        let mut stream = res.bytes_stream();
        let mut buffer = String::new();
        let mut current_event = String::new();

        while let Some(chunk_result) = stream.next().await {
            let bytes = chunk_result.map_err(|e| e.to_string())?;
            let chunk_str = String::from_utf8_lossy(&bytes);
            buffer.push_str(&chunk_str);

            while let Some(line_end) = buffer.find('\n') {
                let line = buffer.drain(..line_end + 1).collect::<String>();
                let line = line.trim();
                if line.is_empty() {
                    continue;
                }
                if line.starts_with("event: ") {
                    current_event = line[7..].to_string();
                } else if line.starts_with("data: ") {
                    let data_str = &line[6..];
                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(data_str) {
                        if current_event == "content_block_delta" {
                            if let Some(delta) = json.get("delta") {
                                if let Some(text) = delta.get("text").and_then(|t| t.as_str()) {
                                    full_content.push_str(text);
                                    let _ = window.emit("llm-delta", text.to_string());
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        // OpenAI Compatible or Google Gemini request
        let url = combine_url(&payload.base_url, "chat/completions");
        println!("[RUST BACKEND] Posting OpenAI Compatible to URL: {}", url);

        let request_body = serde_json::json!({
            "model": payload.model,
            "messages": payload.messages,
            "stream": true
        });

        let res = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await
            .map_err(|e| format!("OpenAI request failed: {}", e))?;

        let status = res.status();
        println!("[RUST BACKEND] OpenAI Compatible Response Status: {}", status);

        if !status.is_success() {
            let error_text = res.text().await.unwrap_or_default();
            println!("[RUST BACKEND] OpenAI Compatible Error Body: {}", error_text);
            return Err(format!("API returned error {}: {}", status, error_text));
        }

        let mut stream = res.bytes_stream();
        let mut buffer = String::new();

        while let Some(chunk_result) = stream.next().await {
            let bytes = chunk_result.map_err(|e| e.to_string())?;
            let chunk_str = String::from_utf8_lossy(&bytes);
            buffer.push_str(&chunk_str);

            while let Some(line_end) = buffer.find('\n') {
                let line = buffer.drain(..line_end + 1).collect::<String>();
                let line = line.trim();
                if line.is_empty() {
                    continue;
                }
                if line.starts_with("data: ") {
                    let data_str = &line[6..];
                    if data_str == "[DONE]" {
                        break;
                    }
                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(data_str) {
                        if let Some(choices) = json.get("choices").and_then(|c| c.as_array()) {
                            if let Some(choice) = choices.get(0) {
                                if let Some(delta) = choice.get("delta") {
                                    if let Some(content) = delta.get("content").and_then(|c| c.as_str()) {
                                        full_content.push_str(content);
                                        let _ = window.emit("llm-delta", content.to_string());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    println!("[RUST BACKEND] Streaming completed. Accumulated content length: {}", full_content.len());
    Ok(full_content)
}
