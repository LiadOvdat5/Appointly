import React from "react";

export type ParagraphProps = {
  size?: "sm" | "md" | "lg";
  color?: "black" | "white" | "gray";
  weight?: "normal" | "medium" | "bold";
  align?: "left" | "center" | "right";
  style?: string;
  children: React.ReactNode;
};

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const colorMap = {
  black: "text-black",
  white: "text-white",
  gray: "text-gray-500",
};

const weightMap = {
  normal: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
};

const alignMap = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export const Paragraph: React.FC<ParagraphProps> = ({
  size = "md",
  color = "black",
  weight = "normal",
  align = "left",
  style = "",
  children,
}) => {
  const className = [
    sizeMap[size],
    colorMap[color],
    weightMap[weight],
    alignMap[align],
    style,
  ]
    .join(" ")
    .trim();

  return <p className={className}>{children}</p>;
};
