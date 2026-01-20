export function ButtonShowcase() {
  return (
    <div className="space-y-4 p-4">
      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white">
        Primary Action
      </button>

      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/20 px-4 py-3 font-bold text-primary">
        Secondary Action
      </button>

      <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-bold text-[#111418] dark:border-gray-700 dark:text-white">
        Outline / Ghost
      </button>

      <button
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-200 px-4 py-3 font-bold text-gray-400 dark:bg-gray-800"
      >
        Disabled State
      </button>

      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white opacity-80">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        Loading State
      </button>
    </div>
  );
}
