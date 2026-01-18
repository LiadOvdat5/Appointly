import React from "react";
import { Label } from "../Topography/Label";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  success,
  disabled = false,
  required = false,
  className = "",
}) => (
  <div className={`mb-4 w-full ${className}`}>
    {label && (
      <Label style="mb-1 block" htmlFor={label}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
    )}
    <select
      id={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`w-full border border-black rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black ${
        error ? "border-red-500" : ""
      } ${success ? "border-green-500" : ""}`}
    >
      <option value="" disabled>
        Select an option
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    {success && <div className="text-xs text-green-500 mt-1">{success}</div>}
  </div>
);
