import { useState, useEffect } from "react";
import { readFile, invoke, getAppWindow } from "./tauri-utils";
import { useProfilesStore, useFormStore, useActiveFieldStore } from "./store";
import {
  ProfileModal,
  SaveProfileModal,
  ModalTriggerButton,
  ParamInput,
} from "./components";

export default function App() {
  const { setProfiles } = useProfilesStore();
  const { formState, updateField } = useFormStore();
  const { activeField, setActiveField, deactiveField } = useActiveFieldStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const appWindow = getAppWindow();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    (async () => setProfiles(await readFile("profiles.json")))();
  }, []);

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
      <div className="profile-button-container">
        <ModalTriggerButton modalName="profiles" label="Select Profile" />
        <ModalTriggerButton modalName="saveProfile" label="Save Profile" />
      </div>
      <ProfileModal />
      <SaveProfileModal />
      <div className="form-container">
        <header
          data-tauri-drag-region
          className={`form-header ${isScrolled ? "scrolled" : ""}`}
        >
          <div
            data-tauri-drag-region
            className={`titleBarBtns ${isScrolled ? "no-rounded" : ""}`}
          >
            {isScrolled && (
              <p data-tauri-drag-region className="h-scrolled">
                Golestan API
              </p>
            )}
            <div className="button-container">
              <button
                className={`topBtn minimizeBtn ${
                  isScrolled ? "topBtn-nor" : ""
                }`}
                onClick={() => appWindow.minimize()}
              ></button>
              <button
                className={`topBtn closeBtn ${isScrolled ? "topBtn-nor" : ""}`}
                onClick={() => appWindow.close()}
              >
                x
              </button>
            </div>
          </div>
          <h2 data-tauri-drag-region>Golestan API</h2>
          <p data-tauri-drag-region className="subtitle">
            Configure your service parameters below
          </p>
        </header>
        <div className="form-content">
          <div className="form-section credentials-section">
            <h3>Authentication</h3>
            <div className="input-grid">
              <ParamInput labelText="User Name" fieldName="userName" />
              <ParamInput
                labelText="Password"
                type="password"
                fieldName="password"
              />
            </div>
          </div>
          <div className="form-section">
            <div className="input-grid">
              <ParamInput labelText="Report ID" fieldName="reportId" />
              <ParamInput labelText="Secret Code" fieldName="secretCode" />
            </div>
          </div>
          <div className="form-section">
            <div className="filter-grid">
              <ParamInput
                labelText="Public Filter"
                type="textarea"
                fieldName="publicFilter"
              />
              <ParamInput
                labelText="Private Filter"
                type="textarea"
                fieldName="privateFilter"
              />
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
                  value={formState.url}
                  onChange={(e) => updateField("url", e.target.value)}
                  onFocus={() => setActiveField("url")}
                  onBlur={deactiveField}
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
                <textarea className="result-display">{result}</textarea>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
