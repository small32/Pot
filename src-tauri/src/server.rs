use crate::config::{get, set};
use crate::window::*;
use log::{info, warn};
use std::io::Read;
use std::thread;
use tauri::api::notification;
use tauri::Manager;
use tiny_http::{Request, Response, Server};

pub fn start_server() {
    let port = match get("server_port").and_then(|v| v.as_i64()) {
        Some(v) if (1..=65535).contains(&v) => v,
        _ => {
            set("server_port", 60828);
            60828
        }
    };
    thread::spawn(move || {
        let server = match Server::http(format!("127.0.0.1:{port}")) {
            Ok(v) => v,
            Err(e) => {
                let identifier = crate::APP
                    .get()
                    .map(|app| app.config().tauri.bundle.identifier.clone())
                    .unwrap_or_else(|| "com.pot-app.desktop".to_string());
                let _ = notification::Notification::new(&identifier)
                    .title("Server start failed")
                    .body("Please Change Server Port and restart the application")
                    .show();
                warn!("Server start failed: {}", e);
                return;
            }
        };
        for request in server.incoming_requests() {
            http_handle(request);
        }
    });
}

fn http_handle(request: Request) {
    info!("Handle {} request", request.url());
    match request.url() {
        "/" => handle_translate(request),
        "/config" => handle_config(request),
        "/translate" => handle_translate(request),
        "/selection_translate" => handle_selection_translate(request),
        "/input_translate" => handle_input_translate(request),
        "/ocr_recognize" => handle_ocr_recognize(request),
        "/ocr_translate" => handle_ocr_translate(request),
        "/ocr_recognize?screenshot=false" => handle_ocr_recognize(request),
        "/ocr_translate?screenshot=false" => handle_ocr_translate(request),
        "/ocr_recognize?screenshot=true" => handle_ocr_recognize(request),
        "/ocr_translate?screenshot=true" => handle_ocr_translate(request),
        _ => {
            warn!("Unknown request url: {}", request.url());
            let _ = request.respond(Response::empty(404u16));
        }
    }
}

fn handle_config(request: Request) {
    config_window();
    response_ok(request);
}

fn handle_translate(mut request: Request) {
    let mut content = Vec::new();
    let read_result = {
        let mut reader = request.as_reader().take(1024 * 1024);
        reader.read_to_end(&mut content)
    };
    if let Err(e) = read_result {
        warn!("Read translate request body failed: {}", e);
        let _ = request.respond(Response::empty(400u16));
        return;
    }
    text_translate(String::from_utf8_lossy(&content).to_string());
    response_ok(request);
}

fn handle_selection_translate(request: Request) {
    selection_translate();
    response_ok(request);
}

fn handle_input_translate(request: Request) {
    input_translate();
    response_ok(request);
}

fn handle_ocr_recognize(request: Request) {
    if request.url().ends_with("false") {
        recognize_window();
    } else {
        ocr_recognize();
    }
    response_ok(request);
}

fn handle_ocr_translate(request: Request) {
    if request.url().ends_with("false") {
        image_translate();
    } else {
        ocr_translate();
    }
    response_ok(request);
}

fn response_ok(request: Request) {
    let response = Response::from_string("ok");
    let _ = request.respond(response);
}
