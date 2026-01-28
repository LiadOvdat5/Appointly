import { MaterialIcon } from "./MaterialIcon";

interface HowItWorksStep {
  iconName: string;
  title: string;
  description: string;
}

interface HowItWorksProps {
  title?: string;
  steps: HowItWorksStep[];
}

/**
 * HowItWorks - Timeline-style component showing step-by-step process
 * Displays steps with icons, titles, and descriptions connected by a vertical line
 */
export const HowItWorks = ({
  title = "How it works",
  steps,
}: HowItWorksProps) => {
  return (
    <div className="px-4 pt-10 pb-6">
      <h2 className="text-[#0e141b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6">
        {title}
      </h2>
      <div className="flex flex-col gap-8 relative">
        {/* Vertical connecting line */}
        <div className="absolute ltr:left-6 rtl:right-6 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700 -z-0"></div>

        {steps.map((step, index) => (
          <div key={index} className="flex gap-4 items-start relative z-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1980e6] text-white font-bold shadow-md">
              <MaterialIcon name={step.iconName} />
            </div>
            <div className="flex flex-col pt-1">
              <h3 className="text-[#0e141b] dark:text-white text-lg font-bold">
                {step.title}
              </h3>
              <p className="text-[#4e7397] dark:text-gray-400 text-sm leading-normal">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
