import React from "react";

export type LabelProps = {
  htmlFor?: string;
  size?: "sm" | "md";
  color?: "black" | "gray";
  weight?: "normal" | "medium";
  align?: "left" | "center" | "right";
  style?: string;
  children: React.ReactNode;
  className?: string;
};

const sizeMap = {
  sm: "text-xs",
  md: "text-sm",
};

const colorMap = {
  black: "text-black",
  gray: "text-gray-500",
};

const weightMap = {
  normal: "font-normal",
  medium: "font-medium",
};

const alignMap = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export const Label: React.FC<LabelProps> = ({
  htmlFor,
  size = "md",
  color = "gray",
  weight = "normal",
  align = "left",
  style = "",
  children,
  className = "",
}) => {
  const classes = [
    sizeMap[size],
    colorMap[color],
    weightMap[weight],
    alignMap[align],
    style,
    className,
  ]
    .join(" ")
    .trim();

  return (
    <label htmlFor={htmlFor} className={classes}>
      {children}
    </label>
  );
};
