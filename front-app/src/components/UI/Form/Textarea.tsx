import React from "react";
import { Label } from "../Topography/Label";

export type TextareaProps = {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
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
    <textarea
      id={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={`w-full border border-black rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black resize-none ${
        error ? "border-red-500" : ""
      } ${success ? "border-green-500" : ""}`}
      rows={4}
    />
    {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    {success && <div className="text-xs text-green-500 mt-1">{success}</div>}
  </div>
);
