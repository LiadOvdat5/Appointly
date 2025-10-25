import type { JSX } from "react";

type HeadingProps = {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  align?: "left" | "center" | "right";
  style?: string;
};

const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  className = "",
  align = "left",
  style = "",
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const baseStyles = "font-bold text-gray-900";
  const sizes = {
    1: "text-4xl",
    2: "text-3xl",
    3: "text-2xl",
    4: "text-xl",
    5: "text-lg",
    6: "text-base",
  };

  const allClasses = [
    baseStyles,
    sizes[level],
    `text-${align}`,
    style,
    className,
  ]
    .join(" ")
    .trim();

  return <Tag className={allClasses}>{children}</Tag>;
};

export default Heading;
