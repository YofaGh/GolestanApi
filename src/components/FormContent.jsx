import { useState } from "react";
import { ParamInput } from ".";
import { invoke } from "../tauri-utils";
import { useFormStore, useActiveFieldStore, useReqStore } from "../store";

export default function FormContent() {
  const { formState, updateField } = useFormStore();
  const { activeField, setActiveField, deactiveField } = useActiveFieldStore();
  const [loading, setLoading] = useState(false);
  const { setResult, setError } = useReqStore();

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
    <div>
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
        <div className={`url-group ${activeField === "url" ? "active" : ""}`}>
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
    </div>
  );
}
