import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Traps focus inside `containerRef` while active.
 * On activation the first focusable element receives focus.
 * On deactivation focus returns to `returnRef` (the trigger element).
 *
 * Usage:
 *   const triggerRef = useRef<HTMLButtonElement>(null);
 *   const { containerRef } = useFocusTrap({ active: isOpen, returnRef: triggerRef });
 *   <div ref={containerRef}>…modal content…</div>
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  active,
  returnRef,
}: {
  active: boolean;
  returnRef?: React.RefObject<HTMLElement | null>;
}) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // Move focus to the first focusable element inside the container
    const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    firstFocusable?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        container!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
      ).filter((el) => !el.closest("[inert]"));

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

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

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the trigger element when the trap deactivates
      returnRef?.current?.focus();
    };
  }, [active, returnRef]);

  return { containerRef };
}
