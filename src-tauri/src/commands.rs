use crate::error::Error;
use crate::utils::encode_xml;
use reqwest::{Client, Request};
use std::sync::Arc;
use tauri::State;
use tokio::sync::{oneshot, Mutex, MutexGuard};

pub struct AppState {
    pub cancel_tx: Option<oneshot::Sender<()>>,
}

#[tauri::command]
pub async fn cancel_request(state: State<'_, Arc<Mutex<AppState>>>) -> Result<(), Error> {
    let mut state: MutexGuard<'_, AppState> = state.lock().await;
    if let Some(cancel_tx) = state.cancel_tx.take() {
        cancel_tx
            .send(())
            .map_err(|_| Error::ReqwestError("Could not cancel the request".to_string()))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn get_data(
    state: State<'_, Arc<Mutex<AppState>>>,
    user_name: String,
    password: String,
    report_id: String,
    secret_code: String,
    public_filter: String,
    private_filter: String,
    url: String,
) -> Result<String, Error> {
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
