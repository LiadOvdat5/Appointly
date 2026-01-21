import React from "react";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

export function SectionTitle({ children, className, htmlFor = "" }: BaseProps) {
  return (
    <h2
      className={[
        "border-b border-gray-100 px-4 pb-3 pt-8 text-[22px] font-bold leading-tight tracking-[-0.015em] text-[#111418]",
        "dark:border-gray-800 dark:text-white",
        className,
        htmlFor,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </h2>
  );
}

export function Label({ children, className, htmlFor = "" }: BaseProps) {
  return (
    <p
      className={[
        "mb-1 text-[10px] font-medium uppercase text-gray-400",
        className,
        htmlFor,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
}

export function H1({ children, className, htmlFor = "" }: BaseProps) {
  return (
    <h1
      className={[
        "text-[32px] font-bold leading-tight tracking-[-0.015em] text-[#111418]",
        "dark:text-white",
        className,
        htmlFor,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className, htmlFor = "" }: BaseProps) {
  return (
    <h2
      className={[
        "text-[28px] font-bold leading-tight tracking-[-0.015em] text-[#111418]",
        "dark:text-white",
        className,
        htmlFor,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className, htmlFor = "" }: BaseProps) {
  return (
    <h3
      className={[
        "text-2xl font-bold leading-tight tracking-[-0.015em] text-[#111418]",
        "dark:text-white",
        className,
        htmlFor,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </h3>
  );
}

export function Paragraph({ children, className, htmlFor = "" }: BaseProps) {
  return (
    <p
      className={[
        "text-base leading-relaxed text-gray-600",
        "dark:text-gray-400",
        className,
        htmlFor,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
}

export function Caption({ children, className, htmlFor = "" }: BaseProps) {
  return (
    <p
      className={[
        "text-xs font-medium italic text-gray-500",
        "dark:text-gray-500",
        className,
        htmlFor,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
}
