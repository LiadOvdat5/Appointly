import React from "react";
import { Label } from "../Typography/Label";

export type ToggleSwitchProps = {
  label?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
};

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => (
  <div className={`mb-4 w-full ${className}`}>
    {label && <Label style="mb-1 block">{label}</Label>}
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <span className="w-10 h-6 bg-gray-300 rounded-full relative transition-colors peer-checked:bg-black">
        <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5"></span>
      </span>
    </label>
  </div>
);
