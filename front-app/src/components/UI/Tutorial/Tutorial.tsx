import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export type TutorialPlacement = "top" | "bottom" | "left" | "right" | "auto";

export interface TutorialStep {
  /** CSS selector for the element to highlight. */
  target: string;
  /** i18next key for the step title (under namespace "tutorials"). */
  titleKey: string;
  /** i18next key for the step body text (under namespace "tutorials"). */
  bodyKey: string;
  placement?: TutorialPlacement;
}

interface Props {
  /** Unique key that identifies this tutorial (used by useTutorial for seen-state). */
  tutorialKey: string;
  /** Array of steps to walk through. */
  steps: TutorialStep[];
  /** Called when the user completes the last step. */
  onComplete: () => void;
  /** Called when the user skips at any step. */
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TOOLTIP_GAP = 12; // px between target edge and tooltip
const TOOLTIP_MARGIN = 8; // viewport margin

function getTargetRect(selector: string): TargetRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

type TooltipPos = { top: number; left: number; maxWidth: number };

function computeTooltipPosition(
  rect: TargetRect,
  tooltipEl: HTMLElement | null,
  placement: TutorialPlacement,
  isRtl: boolean,
): TooltipPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = tooltipEl?.offsetWidth ?? 320;
  const th = tooltipEl?.offsetHeight ?? 200;

  const spaceAbove = rect.top - TOOLTIP_GAP;
  const spaceBelow = vh - rect.top - rect.height - TOOLTIP_GAP;
  const spaceLeft = rect.left - TOOLTIP_GAP;
  const spaceRight = vw - rect.left - rect.width - TOOLTIP_GAP;

  let resolved = placement;
  if (resolved === "auto") {
    // Pick the side with most room, prefer below
    const max = Math.max(spaceAbove, spaceBelow, spaceLeft, spaceRight);
    if (max === spaceBelow) resolved = "bottom";
    else if (max === spaceAbove) resolved = "top";
    else if (max === spaceRight) resolved = "right";
    else resolved = "left";
  }

  // For RTL, mirror left/right.
  if (isRtl) {
    if (resolved === "left") resolved = "right";
    else if (resolved === "right") resolved = "left";
  }

  let top = 0;
  let left = 0;
  const maxWidth = Math.min(360, vw - TOOLTIP_MARGIN * 2);

  const centerY = rect.top + rect.height / 2 - th / 2;
  const centerX = rect.left + rect.width / 2 - tw / 2;

  if (resolved === "bottom") {
    top = rect.top + rect.height + TOOLTIP_GAP;
    left = centerX;
  } else if (resolved === "top") {
    top = rect.top - th - TOOLTIP_GAP;
    left = centerX;
  } else if (resolved === "right") {
    top = centerY;
    left = rect.left + rect.width + TOOLTIP_GAP;
  } else {
    // left
    top = centerY;
    left = rect.left - tw - TOOLTIP_GAP;
  }

  // Clamp to viewport
  left = Math.max(TOOLTIP_MARGIN, Math.min(left, vw - tw - TOOLTIP_MARGIN));
  top = Math.max(TOOLTIP_MARGIN, Math.min(top, vh - th - TOOLTIP_MARGIN));

  return { top, left, maxWidth };
}

export const Tutorial: React.FC<Props> = ({
  steps,
  onComplete,
  onSkip,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos>({ top: 0, left: 0, maxWidth: 360 });

  const tooltipRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const step = steps[currentIndex];
  const totalSteps = steps.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;

  // Measure target + compute tooltip position whenever the step changes.
  const measureAndPosition = useCallback(() => {
    if (!step) return;
    const rect = getTargetRect(step.target);
    setTargetRect(rect);
    setTooltipPos(
      computeTooltipPosition(
        rect ?? { top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 160, width: 0, height: 0 },
        tooltipRef.current,
        step.placement ?? "auto",
        isRtl,
      ),
    );
  }, [step, isRtl]);

  // After DOM paints, measure positions.
  useLayoutEffect(() => {
    measureAndPosition();
  }, [measureAndPosition]);

  // Re-measure on window resize.
  useEffect(() => {
    window.addEventListener("resize", measureAndPosition);
    return () => window.removeEventListener("resize", measureAndPosition);
  }, [measureAndPosition]);

  // Scroll target into view when step changes.
  useEffect(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      // Re-measure after scroll settles.
      const timer = setTimeout(measureAndPosition, 300);
      return () => clearTimeout(timer);
    }
  }, [step, measureAndPosition]);

  // Focus the first button on mount and step change.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      firstFocusableRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [currentIndex]);

  // Keyboard handling.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onSkip();
      }
      // Tab focus trap: redirect to tooltip if focus escapes.
      if (e.key === "Tab" && tooltipRef.current) {
        const focusables = Array.from(
          tooltipRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSkip]);

  const handleBack = () => {
    if (!isFirst) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (!step) return null;

  const spotlightPadding = 6;
  const spotlightStyle = targetRect
    ? {
        position: "fixed" as const,
        top: targetRect.top - spotlightPadding,
        left: targetRect.left - spotlightPadding,
        width: targetRect.width + spotlightPadding * 2,
        height: targetRect.height + spotlightPadding * 2,
        borderRadius: 8,
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
        pointerEvents: "none" as const,
        zIndex: 9998,
        transition: "top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease",
      }
    : {
        // No target found: full overlay only
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        width: 0,
        height: 0,
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
        pointerEvents: "none" as const,
        zIndex: 9998,
      };

  const overlayClickHandler = () => onSkip();

  // Button row — mirrored for RTL.
  const backBtn = (
    <button
      key="back"
      onClick={handleBack}
      disabled={isFirst}
      className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black"
    >
      {t("tutorials.common.back")}
    </button>
  );

  const nextBtn = (
    <button
      key="next"
      ref={isFirst ? firstFocusableRef : undefined}
      onClick={handleNext}
      className="px-4 py-1.5 text-sm rounded bg-black text-white hover:bg-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-black"
    >
      {isLast ? t("tutorials.common.finish") : t("tutorials.common.next")}
    </button>
  );

  const buttonRow = isRtl ? [nextBtn, backBtn] : [backBtn, nextBtn];

  return createPortal(
    <>
      {/* Full-screen click-to-skip overlay (below spotlight) */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9997 }}
        onClick={overlayClickHandler}
        aria-hidden="true"
      />

      {/* Spotlight cutout */}
      <div style={spotlightStyle} aria-hidden="true" />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(step.titleKey)}
        style={{
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          maxWidth: tooltipPos.maxWidth,
          zIndex: 9999,
          width: "max-content",
        }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            {/* Progress indicator */}
            <p
              className="text-xs font-medium text-gray-400 mb-1"
              aria-live="polite"
              aria-atomic="true"
            >
              {t("tutorials.common.stepOf", {
                current: currentIndex + 1,
                total: totalSteps,
              })}
            </p>
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">
              {t(step.titleKey)}
            </h3>
          </div>
          {/* Skip / close button */}
          <button
            ref={isFirst ? undefined : firstFocusableRef}
            onClick={onSkip}
            aria-label={t("tutorials.common.skip")}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black rounded p-0.5 flex-shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <p
          className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
          aria-live="polite"
          aria-atomic="true"
        >
          {t(step.bodyKey)}
        </p>

        {/* Dot progress + navigation */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Step dots */}
          <div className="flex gap-1.5 items-center" aria-hidden="true">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`inline-block rounded-full transition-all ${
                  i === currentIndex
                    ? "w-4 h-2 bg-black dark:bg-white"
                    : "w-2 h-2 bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className={`flex gap-2 items-center ${isRtl ? "flex-row-reverse" : ""}`}>
            {buttonRow}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default Tutorial;
