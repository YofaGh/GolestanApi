use reqwest::Error as ReqwestError;
use serde::{Deserialize, Serialize};
use std::{
    fmt::{Display, Formatter, Result as FmtResult},
    io::Error as IoError,
    path::Path,
};

#[derive(Debug, Serialize, Deserialize)]
pub enum Error {
    DirectoryOperation(String),
    FileOperation(String),
    Other(String),
    ReqwestError(String), 
}

impl Error {
    pub fn directory(action: &str, path: impl AsRef<Path>, err: IoError) -> Self {
        Self::DirectoryOperation(format!("Failed to {action} the directory {}: {err}",
        path.as_ref().to_string_lossy().to_string()))
    }
    pub fn file(action: &str, path: impl AsRef<Path>, err: IoError) -> Self {
        Self::FileOperation(format!(
            "Failed to {action} the file {}: {err}",
            path.as_ref().to_string_lossy().to_string()
        ))
    }
}

impl Display for Error {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        let (error_type, msg) = match self {
            Error::DirectoryOperation(msg) => ("Directory operation error", msg),
            Error::FileOperation(msg) => ("File operation error", msg),
            Error::Other(msg) => ("Other error", msg),
            Error::ReqwestError(msg) => ("Reqwest error", msg),
        };
        write!(f, "{error_type}: {msg}")
    }
}

impl From<ReqwestError> for Error {
    fn from(err: ReqwestError) -> Self {
        Error::ReqwestError(err.to_string())
    }
}
