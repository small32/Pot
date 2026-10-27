use log::{info, warn};

#[tauri::command]
pub fn screenshot(x: i32, y: i32) -> Result<(), String> {
    use crate::APP;
    use dirs::cache_dir;
    use screenshots::{Compression, Screen};
    use std::fs;
    info!("Screenshot screen with position: x={}, y={}", x, y);
    let screens = Screen::all().map_err(|e| e.to_string())?;
    for screen in screens {
        let display_info = screen.display_info;
        info!("Screen: {:?}", display_info);
        if display_info.x == x && display_info.y == y {
            let handle = APP.get().ok_or_else(|| "App not initialized".to_string())?;
            let mut app_cache_dir_path = cache_dir().ok_or_else(|| "Get Cache Dir Failed".to_string())?;
            app_cache_dir_path.push(&handle.config().tauri.bundle.identifier);
            if !app_cache_dir_path.exists() {
                // 创建目录
                fs::create_dir_all(&app_cache_dir_path).map_err(|e| e.to_string())?;
            }
            app_cache_dir_path.push("pot_screenshot.png");

            let image = screen.capture().map_err(|e| e.to_string())?;
            let buffer = image.to_png(Compression::Fast).map_err(|e| e.to_string())?;
            fs::write(&app_cache_dir_path, buffer).map_err(|e| e.to_string())?;
            return Ok(());
        }
    }
    let message = format!("Screen not found: x={}, y={}", x, y);
    warn!("{}", message);
    Err(message)
}
