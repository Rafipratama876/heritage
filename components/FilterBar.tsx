"use client";

import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

export default function FilterBar({
  title,
  options,
  active,
  onChange,
}: {
  title: string;
  options: FilterOption[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            aria-pressed={active === opt.value}
            className={cn(
              "px-4 py-2 text-xs tracking-wide border transition-colors",
              active === opt.value
                ? "border-brass text-brass bg-brass/10"
                : "border-line text-ivory/70 hover:border-brass/60 hover:text-ivory",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
