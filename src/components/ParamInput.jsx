import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);

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
    deactiveField();
  };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div
      className={`input-group ${activeField === fieldName ? "active" : ""} ${
        isInvalid ? "invalid" : ""
      }`}
    >
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
        <div className="input-wrapper">
          <input
            type={inputType}
            value={formState[fieldName]}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={() => setActiveField(fieldName)}
          />
          {isPassword && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
