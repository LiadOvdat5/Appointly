import React, { useId, useMemo, useState } from "react";

type Mode = "single" | "multi";

export type SelectOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
};

type RenderItemArgs<T extends string> = {
  option: SelectOption<T>;
  selected: boolean;
  toggle: () => void;
  index: number;
};

type Props<T extends string> = {
  label?: string;

  mode: Mode;
  options: SelectOption<T>[];

  // Controlled:
  value?: T | T[];
  // Uncontrolled:
  defaultValue?: T | T[];

  onChange?: (next: T | T[]) => void;

  // Layout:
  className?: string;
  itemClassName?: string;

  // Render:
  renderItem: (args: RenderItemArgs<T>) => React.ReactNode;
};

function toArray<T extends string>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export function SelectableGroup<T extends string>({
  label,
  mode,
  options,
  value,
  defaultValue,
  onChange,
  className,
  renderItem,
}: Props<T>) {
  const groupId = useId();
  const isControlled = value !== undefined;

  const [internal, setInternal] = useState<T[]>(
    toArray(defaultValue as T | T[] | undefined),
  );

  const selectedValues = isControlled
    ? toArray(value as T | T[] | undefined)
    : internal;

  const setSelectedValues = (next: T[]) => {
    if (!isControlled) setInternal(next);
    onChange?.(mode === "single" ? next[0] : next);
  };

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const toggleValue = (v: T) => {
    if (mode === "single") {
      setSelectedValues([v]);
      return;
    }

    const next = new Set(selectedSet);
    if (next.has(v)) {
      next.delete(v);
    } else {
      next.add(v);
    }
    setSelectedValues(Array.from(next));
  };

  // Keyboard support (single mode): arrow keys change selection
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (mode !== "single") return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      return;

    e.preventDefault();
    const enabled = options.filter((o) => !o.disabled);
    if (enabled.length === 0) return;

    const current = selectedValues[0];
    const idx = Math.max(
      0,
      enabled.findIndex((o) => o.value === current),
    );
    const delta = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
    const next = enabled[(idx + delta + enabled.length) % enabled.length];
    setSelectedValues([next.value]);
  };

  return (
    <div className={className}>
      {label && (
        <p className="mb-3 text-sm font-semibold text-[#111418] dark:text-gray-200">
          {label}
        </p>
      )}

      <div
        role={mode === "single" ? "radiogroup" : "group"}
        aria-labelledby={label ? `${groupId}-label` : undefined}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="outline-none"
      >
        {options.map((option, index) =>
          renderItem({
            option,
            index,
            selected: selectedSet.has(option.value),
            toggle: option.disabled
              ? () => {}
              : () => toggleValue(option.value),
          }),
        )}
      </div>
    </div>
  );
}
