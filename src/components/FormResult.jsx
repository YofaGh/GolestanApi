import { useReqStore } from "../store";
import { XMLResultFormatter } from "../utils";

export default function FormResult() {
  const { result, error } = useReqStore();

  if (error)
    return (
      <div className="error-message" role="alert">
        <span className="error-icon">!</span>
        <span className="error-text">{error}</span>
      </div>
    );
  if (result)
    return (
      <div className="result-section">
        <h3>Results</h3>
        <div className="result-container">
          <textarea
            readOnly
            className="result-display"
            value={XMLResultFormatter(result)}
          ></textarea>
        </div>
      </div>
    );
  return null;
}
