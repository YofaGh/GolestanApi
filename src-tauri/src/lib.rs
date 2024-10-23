fn encode_xml(input: String) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

#[tauri::command]
async fn get_data(
    login_name: String,
    password: String,
    report_id: String,
    secret_code: String,
    public_filter: String,
    private_filter: String,
    url: String,
) -> String {
    let client = reqwest::Client::new();
    let soap_body = format!(
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
        public_filter,
        encode_xml(private_filter),
        report_id
    );
    let response = client
        .post(url)
        .header("Content-Type", "text/xml; charset=utf-8")
        .header("SOAPAction", "urn:nowpardaz/golInfo")
        .body(soap_body)
        .send()
        .await.unwrap();
    response.text().await.unwrap()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
