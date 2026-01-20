import { useState } from "react";

export function FormShowcase() {
  const [push, setPush] = useState(true);

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
          Full Name
        </label>
        <input
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-[#111418] outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          placeholder="John Doe"
          type="text"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
          Service Category
        </label>
        <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white p-3 text-[#111418] outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option>Barbershop</option>
          <option>Nail Salon</option>
          <option>Consulting</option>
        </select>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-semibold text-[#111418] dark:text-gray-200">
          Push Notifications
        </span>

        <button
          type="button"
          onClick={() => setPush((v) => !v)}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition dark:bg-gray-700"
          aria-pressed={push}
          aria-label="Toggle push notifications"
        >
          <span
            className={[
              "absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white border border-gray-300 transition",
              push ? "translate-x-full border-white" : "translate-x-0",
              push ? "bg-white" : "bg-white",
            ].join(" ")}
          />
          <span
            className={`h-6 w-11 rounded-full ${push ? "bg-primary" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
