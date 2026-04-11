import { MaterialIcon } from "./MaterialIcon";

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center">
      <MaterialIcon
        name="info"
        className="text-sm text-gray-400 hover:text-primary cursor-help transition-colors"
      />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 text-xs bg-gray-900 dark:bg-gray-700 text-white rounded-xl px-3 py-2 z-20 shadow-xl leading-relaxed">
        {text}
      </span>
    </span>
  );
}
