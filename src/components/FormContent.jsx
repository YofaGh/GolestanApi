import { ParamInput } from ".";
import { invoke } from "../tauri-utils";
import { handleGetData } from "../utils";
import {
  useFormStore,
  useActiveFieldStore,
  useReqStore,
  useValidationStore,
} from "../store";

export default function FormContent() {
  const { formState, updateField } = useFormStore();
  const { activeField, setActiveField, deactiveField } = useActiveFieldStore();
  const { loading } = useReqStore();
  const { validationError } = useValidationStore();

  const handleCancel = async () => {
    await invoke("cancel_request");
  };

  return (
    <div>
      <div className="form-section credentials-section">
        <div style={{ height: "4rem" }} />
        {validationError && (
          <div className="validation-error" role="alert">
            <span className="error-icon">!</span>
            <span className="error-text">{validationError}</span>
          </div>
        )}

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
              <button onClick={handleGetData} className="submit-button">
                <span className="button-text">Get Data</span>
                <span className="button-icon">→</span>
              </button>
              {loading && (
                <button
                  onClick={handleCancel}
                  className="submit-button cancel-button"
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
