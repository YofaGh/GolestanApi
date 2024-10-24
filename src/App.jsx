import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [activeField, setActiveField] = useState("");
  const [formState, setFormState] = useState({
    loginName: "",
    password: "",
    reportId: "",
    secretCode: "",
    publicFilter: "",
    privateFilter: "",
    url: "http://golestan._.ac.ir/golestanservice/gservice.asmx",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = async () => {
    await invoke("cancel_request");
  };

  const handleGetData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await invoke("get_data", { ...formState });
      setResult(JSON.stringify(data, null, 2));
      const button = document.querySelector(".submit-button");
      button.classList.add("success");
      setTimeout(() => button.classList.remove("success"), 2000);
    } catch (err) {
      setError(err.message);
      const button = document.querySelector(".submit-button");
      button.classList.add("error");
      setTimeout(() => button.classList.remove("error"), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="form-container">
        <header className="form-header">
          <h2>Parameters Configuration</h2>
          <p className="subtitle">Configure your service parameters below</p>
        </header>
        <div className="form-content">
          <div className="form-section credentials-section">
            <h3>Authentication</h3>
            <div className="input-grid">
              <div
                className={`input-group ${
                  activeField === "loginName" ? "active" : ""
                }`}
              >
                <label>
                  <span className="label-text">Login Name</span>
                  <span className="label-hint">Enter your username</span>
                </label>
                <input
                  type="text"
                  name="loginName"
                  value={formState.loginName}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField("loginName")}
                  onBlur={() => setActiveField("")}
                  placeholder="johndoe"
                />
              </div>
              <div
                className={`input-group ${
                  activeField === "password" ? "active" : ""
                }`}
              >
                <label>
                  <span className="label-text">Password</span>
                  <span className="label-hint">Enter your password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formState.password}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField("password")}
                  onBlur={() => setActiveField("")}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Identification</h3>
            <div className="input-grid">
              <div
                className={`input-group ${
                  activeField === "reportId" ? "active" : ""
                }`}
              >
                <label>
                  <span className="label-text">Report ID</span>
                  <span className="label-hint">
                    Enter your report identifier
                  </span>
                </label>
                <input
                  type="text"
                  name="reportId"
                  value={formState.reportId}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField("reportId")}
                  onBlur={() => setActiveField("")}
                  placeholder="1030"
                />
              </div>
              <div
                className={`input-group ${
                  activeField === "secretCode" ? "active" : ""
                }`}
              >
                <label>
                  <span className="label-text">Secret Code</span>
                  <span className="label-hint">Enter your secret code</span>
                </label>
                <input
                  type="text"
                  name="secretCode"
                  value={formState.secretCode}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField("secretCode")}
                  onBlur={() => setActiveField("")}
                  placeholder="SC-456"
                />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Filters</h3>
            <div className="filter-grid">
              <div
                className={`textarea-group ${
                  activeField === "publicFilter" ? "active" : ""
                }`}
              >
                <label>
                  <span className="label-text">Public Filter</span>
                  <span className="label-hint">
                    Enter public filter parameters
                  </span>
                </label>
                <textarea
                  name="publicFilter"
                  value={formState.publicFilter}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField("publicFilter")}
                  onBlur={() => setActiveField("")}
                  placeholder="Enter your public filter configuration..."
                />
              </div>
              <div
                className={`textarea-group ${
                  activeField === "privateFilter" ? "active" : ""
                }`}
              >
                <label>
                  <span className="label-text">Private Filter</span>
                  <span className="label-hint">
                    Enter private filter parameters
                  </span>
                </label>
                <textarea
                  name="privateFilter"
                  value={formState.privateFilter}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField("privateFilter")}
                  onBlur={() => setActiveField("")}
                  placeholder="Enter your private filter configuration..."
                />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Service Configuration</h3>
            <div
              className={`url-group ${activeField === "url" ? "active" : ""}`}
            >
              <label>
                <span className="label-text">WebService URL</span>
                <span className="label-hint">Enter your service endpoint</span>
              </label>
              <div className="url-input-wrapper">
                <input
                  type="url"
                  name="url"
                  value={formState.url}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField("url")}
                  onBlur={() => setActiveField("")}
                  className="url-input"
                />
                <div className="button-group">
                  <button
                    onClick={handleGetData}
                    disabled={loading}
                    className={`submit-button ${loading ? "loading" : ""}`}
                  >
                    <span className="button-text">
                      {loading ? "Processing..." : "Get Data"}
                    </span>
                    <span className="button-icon">→</span>
                  </button>
                  {loading && (
                    <button
                      onClick={handleCancel}
                      className="submit-button"
                      aria-label="Cancel request"
                    >
                      <span className="button-text">Cancel</span>
                      <span className="button-icon">✕</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">!</span>
              <span className="error-text">{error}</span>
            </div>
          )}
          {result && (
            <div className="result-section">
              <h3>Results</h3>
              <div className="result-container">
                <pre className="result-display">{result}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
