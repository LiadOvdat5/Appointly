import React from "react";
import { Label } from "../Topography/Label";

export type FileUploadProps = {
  label?: string;
  value?: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  onChange,
  accept,
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
    <input
      id={label}
      type="file"
      onChange={onChange}
      accept={accept}
      disabled={disabled}
      required={required}
      className="w-full border border-black rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
    />
    {value && (
      <div className="text-xs text-gray-500 mt-1">Selected: {value.name}</div>
    )}
    {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
  </div>
);
