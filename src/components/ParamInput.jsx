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
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
