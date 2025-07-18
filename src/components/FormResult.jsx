import { useState } from "react";
import { useReqStore } from "../store";
import { XMLResultFormatter } from "../utils";

export default function FormResult() {
  const { result, error, loading } = useReqStore();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(XMLResultFormatter(result));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (error) {
    return (
      <div className="error-message" role="alert">
        <span className="error-icon">!</span>
        <span className="error-text">{error}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="result-section" id="results-section">
        <h3>Results</h3>
        <div className="result-container loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <span className="loading-text">Processing...</span>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="result-section">
        <div className="result-header">
          <h3>Results</h3>
          <button
            onClick={handleCopy}
            className={`copy-button ${copySuccess ? "success" : ""}`}
            title="Copy results to clipboard"
          >
            {copySuccess ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <div className="result-container">
          <textarea
            readOnly
            className="result-display"
            value={XMLResultFormatter(result)}
          ></textarea>
        </div>
      </div>
    );
  }

  return null;
}
