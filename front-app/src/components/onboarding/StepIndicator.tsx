import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../UI/MaterialIcon";
import type { Step } from "./onboardingTypes";

interface StepIndicatorProps {
  current: Step;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  const { t } = useTranslation();
  const steps: { labelKey: string; icon: string }[] = [
    { labelKey: "onboarding.steps.businessInfo", icon: "store" },
    { labelKey: "onboarding.steps.services", icon: "design_services" },
    { labelKey: "onboarding.steps.done", icon: "check_circle" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => {
        const num = (i + 1) as Step;
        const done = current > num;
        const active = current === num;
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  done
                    ? "bg-success text-white"
                    : active
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-400 dark:bg-gray-700",
                ].join(" ")}
              >
                {done ? (
                  <MaterialIcon name="check" className="text-[18px]!" />
                ) : (
                  <MaterialIcon name={s.icon} className="text-[18px]!" />
                )}
              </div>
              <span
                className={[
                  "text-[11px] font-medium whitespace-nowrap",
                  active
                    ? "text-primary"
                    : done
                      ? "text-success"
                      : "text-gray-400",
                ].join(" ")}
              >
                {t(s.labelKey)}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  "h-0.5 w-12 mb-5 mx-1 rounded transition-colors",
                  done ? "bg-success" : "bg-gray-200 dark:bg-gray-700",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
