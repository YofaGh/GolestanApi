use std::sync::Arc;
use tauri::{State, generate_context, generate_handler, Builder};
use tokio::sync::{oneshot, Mutex, MutexGuard};
use reqwest::{Client, Request, Error};

struct AppState {
    cancel_tx: Option<oneshot::Sender<()>>,
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
async fn cancel_request(state: State<'_, Arc<Mutex<AppState>>>) -> Result<(), String> {
    let mut state: MutexGuard<'_, AppState> = state.lock().await;
    if let Some(cancel_tx) = state.cancel_tx.take() {
        let _ = cancel_tx.send(());
    }
    Ok(())
}

#[tauri::command]
async fn get_data(
    state: State<'_, Arc<Mutex<AppState>>>,
    login_name: String,
    password: String,
    report_id: String,
    secret_code: String,
    public_filter: String,
    private_filter: String,
    url: String,
) -> Result<String, String> {
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
        login_name,
        password,
        secret_code,
        encode_xml(public_filter),
        encode_xml(private_filter),
        report_id
    );
    let client: Client = reqwest::Client::new();
    let request: Request = client
        .post(url)
        .header("Content-Type", "text/xml; charset=utf-8")
        .header("SOAPAction", "urn:nowpardaz/golInfo")
        .body(soap_body)
        .build()
        .map_err(|e: Error| e.to_string())?;
    let request = client.execute(request);
    let result: String = tokio::select! {
        _ = cancel_rx => {
            "".to_string()
        }
        result = request => {
            match result {
                Ok(resp) => {
                    resp.text().await.unwrap_or_else(|_| "Failed to get text".to_string())
                },
                Err(_) => "".to_string()
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
        .manage(state.clone())
        .invoke_handler(generate_handler![get_data, cancel_request])
        .run(generate_context!())
        .expect("error while running tauri application");
}
