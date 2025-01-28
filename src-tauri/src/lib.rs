mod error;
use error::Error;
use reqwest::{Client, Request};
use std::{
    fs::{create_dir_all, File},
    io::{Error as IoError, Write},
    path::PathBuf,
    sync::Arc,
};
use tauri::{generate_context, generate_handler, App, Builder, Manager, State};
use tokio::sync::{oneshot, Mutex, MutexGuard};

struct AppState {
    cancel_tx: Option<oneshot::Sender<()>>,
}

pub fn load_up_checks(data_dir_path: PathBuf) -> Result<(), Error> {
    create_dir_all(&data_dir_path)
        .map_err(|err: IoError| Error::directory("open", &data_dir_path, err))?;
    let path: &PathBuf = &data_dir_path.join("profiles.json");
    if path.exists() {
        return Ok(());
    }
    let mut file: File = std::fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(path)
        .map_err(|err: IoError| Error::file("open", &path, err))?;
    file.write_all("[]".as_bytes())
        .map_err(|err: IoError| Error::file("write to", &path, err))?;
    file.flush()
        .map_err(|err: IoError| Error::file("flush", &path, err))
}

fn encode_xml(input: String) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

#[tauri::command]
async fn cancel_request(state: State<'_, Arc<Mutex<AppState>>>) -> Result<(), Error> {
    let mut state: MutexGuard<'_, AppState> = state.lock().await;
    if let Some(cancel_tx) = state.cancel_tx.take() {
        cancel_tx
            .send(())
            .map_err(|_| Error::ReqwestError("Could not cancel the request".to_string()))?;
    }
    Ok(())
}

#[tauri::command]
async fn get_data(
    state: State<'_, Arc<Mutex<AppState>>>,
    user_name: String,
    password: String,
    report_id: String,
    secret_code: String,
    public_filter: String,
    private_filter: String,
    url: String,
) -> Result<String, Error> {
    println!("YY");
    let (cancel_tx, cancel_rx) = oneshot::channel();
    {
        let mut state: MutexGuard<'_, AppState> = state.lock().await;
        state.cancel_tx = Some(cancel_tx);
    }
    let soap_body: String = format!(
        r#"<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
        <SOAP-ENV:Body>
            <golInfo xmlns="urn:nowpardaz">
                <login>{}</login>
                <pass>{}</pass>
                <sec>{}</sec>
                <pub>{}</pub>
                <pri>{}</pri>
                <iFID>{}</iFID>
            </golInfo>
        </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>"#,
        user_name,
        password,
        secret_code,
        encode_xml(public_filter),
        encode_xml(private_filter),
        report_id
    );
    let client: Client = Client::new();
    let request: Request = client
        .post(url)
        .header("Content-Type", "text/xml; charset=utf-8")
        .header("SOAPAction", "urn:nowpardaz/golInfo")
        .body(soap_body)
        .build()?;
    let request = client.execute(request);
    let result: String = tokio::select! {
        _ = cancel_rx => {
            String::new()
        }
        result = request => {
            match result {
                Ok(resp) => resp.text().await?,
                Err(_) => String::new()
            }
        }
    };
    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state: Arc<Mutex<AppState>> = Arc::new(Mutex::new(AppState { cancel_tx: None }));
    Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .manage(state.clone())
        .invoke_handler(generate_handler![get_data, cancel_request])
        .setup(|app: &mut App| {
            load_up_checks(app.path().app_data_dir()?).expect("f");
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();
            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}
