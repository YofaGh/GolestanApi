import { XMLInputFormatter } from "../utils";
import {
  useActiveFieldStore,
  useFormStore,
  useValidationStore,
} from "../store";

export default function ParamInput({ labelText, type, fieldName }) {
  const { activeField, setActiveField, deactiveField } = useActiveFieldStore();
  const { formState, updateField } = useFormStore();
  const { invalidFields, clearValidation } = useValidationStore();

  type = type || "text";
  const isInvalid = invalidFields.includes(fieldName);

  const handleChange = (value) => {
    updateField(fieldName, value);
    if (isInvalid) {
      clearValidation();
    }
  };

  const handleBlur = (event) => {
    const formattedValue = XMLInputFormatter(event.target.value);
    updateField(fieldName, formattedValue);
  };

  return (
    <div className={`input-group ${activeField === fieldName ? "active" : ""} ${
      isInvalid ? "invalid" : ""
    }`}>
      <label>
        <span className="label-text">{labelText}</span>
        <span className="label-hint">{`Enter your ${labelText}`}</span>
      </label>
      {type === "textarea" ? (
        <textarea
          value={formState[fieldName]}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => setActiveField(fieldName)}
        />
      ) : (
        <input
          type={type}
          value={formState[fieldName]}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => setActiveField(fieldName)}
        />
      )}
    </div>
  );
}
