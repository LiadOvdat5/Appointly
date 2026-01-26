import React from "react";

type StepProps = {
  icon?: string;
  label: string;
  isFirst?: boolean;
  isLast?: boolean;
};

/**
 * TimelineStep component - A single step in a vertical timeline
 */
export function TimelineStep({ icon, label, isFirst, isLast }: StepProps) {
  return (
    <>
      <div className="flex flex-col items-center gap-1 pt-3 pb-3">
        {!isFirst && (
          <div className="w-[1.5px] bg-[#d0dbe7] dark:bg-gray-700 h-2" />
        )}
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-6 bg-[#1980e6]"
          style={icon ? { backgroundImage: `url("${icon}")` } : undefined}
        />
        {!isLast && (
          <div className="w-[1.5px] bg-[#d0dbe7] dark:bg-gray-700 h-2 grow" />
        )}
      </div>
      <div className="flex flex-1 flex-col pt-3 pb-5">
        <p className="text-[#0e141b] dark:text-white text-base font-medium leading-normal">
          {label}
        </p>
      </div>
    </>
  );
}

type TimelineProps = {
  steps: Array<{
    icon?: string;
    label: string;
  }>;
  className?: string;
};

/**
 * Timeline component - A vertical timeline/stepper component
 */
export function Timeline({ steps, className }: TimelineProps) {
  return (
    <div
      className={["grid grid-cols-[40px_1fr] gap-x-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      {steps.map((step, index) => (
        <TimelineStep
          key={index}
          icon={step.icon}
          label={step.label}
          isFirst={index === 0}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
}
