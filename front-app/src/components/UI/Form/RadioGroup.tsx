import React from "react";
import { Label } from "../Topography/Label";

export type RadioOption = {
  value: string;
  label: string;
};

export type RadioGroupProps = {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: RadioOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value,
  onChange,
  options,
  error,
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
    <div className="flex gap-4">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="radio"
            name={label}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className="accent-black"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
    {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
  </div>
);
