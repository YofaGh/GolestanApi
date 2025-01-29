import { XMLInputFormatter } from "../utils";
import { useActiveFieldStore, useFormStore } from "../store";

export default function ParamInput({ labelText, type, fieldName }) {
  const { activeField, setActiveField, deactiveField } = useActiveFieldStore();
  const { formState, updateField } = useFormStore();
  type = type || "text";

  return (
    <div className={`input-group ${activeField === fieldName ? "active" : ""}`}>
      <label>
        <span className="label-text">{labelText}</span>
        <span className="label-hint">{`Enter your ${labelText}`}</span>
      </label>
      {type === "textarea" ? (
        <textarea
          value={formState[fieldName]}
          onChange={(e) =>
            updateField(fieldName, XMLInputFormatter(e.target.value))
          }
          onFocus={() => setActiveField(fieldName)}
          onBlur={deactiveField}
        />
      ) : (
        <input
          type={type}
          value={formState[fieldName]}
          onChange={(e) => updateField(fieldName, e.target.value)}
          onFocus={() => setActiveField(fieldName)}
          onBlur={deactiveField}
        />
      )}
    </div>
  );
}
