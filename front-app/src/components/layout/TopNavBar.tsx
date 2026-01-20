import { MaterialIcon } from "../MaterialIcon";

type Props = {
  title: string;
  version?: string;
  onBack?: () => void;
};

export function TopNavBar({ title, version = "v1.0.0", onBack }: Props) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-background-dark">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Back"
        >
          <MaterialIcon
            name="arrow_back"
            className="text-[#111418] dark:text-white"
          />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-[#111418] dark:text-white">
          {title}
        </h2>
      </div>

      <div className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
        {version}
      </div>
    </div>
  );
}
