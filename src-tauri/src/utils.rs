use crate::error::Error;
use std::{
    fs::{create_dir_all, File},
    io::{Error as IoError, Write},
    path::PathBuf,
};

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

pub fn encode_xml(input: String) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}
