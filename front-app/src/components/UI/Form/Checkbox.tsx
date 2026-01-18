import React from "react";
import { Label } from "../Topography/Label";

export type CheckboxProps = {
  label?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  error,
  disabled = false,
  required = false,
  className = "",
}) => (
  <div className={`mb-4 w-full ${className}`}>
    <Label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="accent-black"
      />
      {label && (
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
    </Label>
    {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
  </div>
);
