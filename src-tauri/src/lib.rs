mod commands;
mod error;
mod utils;
use commands::{cancel_request, get_data, AppState};
use std::sync::Arc;
use tauri::{generate_context, generate_handler, App, Builder, Manager};
use tokio::sync::Mutex;
use utils::load_up_checks;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state: Arc<Mutex<AppState>> = Arc::new(Mutex::new(AppState { cancel_tx: None }));
    Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .manage(state.clone())
        .invoke_handler(generate_handler![get_data, cancel_request])
        .setup(|app: &mut App| {
            load_up_checks(app.path().app_data_dir()?).expect("error while running load up checks");
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();
            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}
