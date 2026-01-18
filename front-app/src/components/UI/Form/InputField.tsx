import React, { useState } from "react";
import { Label } from "../Topography/Label";
import { GoEye, GoEyeClosed } from "react-icons/go";

export type InputFieldProps = {
  type?: "text" | "email" | "password";
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

export const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  label,
  value,
  onChange,
  placeholder = "",
  error,
  success,
  disabled = false,
  required = false,
  icon,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && (
        <Label style="mb-1 block" htmlFor={label}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-2 text-gray-400">{icon}</span>}
        <input
          id={label}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full border border-black rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black ${
            icon ? "pl-8" : ""
          } ${error ? "border-red-500" : ""} ${
            success ? "border-green-500" : ""
          }`}
        />
        {type === "password" && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 text-gray-400 focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <GoEyeClosed size={18} /> : <GoEye size={18} />}
          </button>
        )}
      </div>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      {success && <div className="text-xs text-green-500 mt-1">{success}</div>}
    </div>
  );
};
