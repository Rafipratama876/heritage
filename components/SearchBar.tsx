"use client";

import { HiSearch, HiX } from "react-icons/hi";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search products or collections…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-lg" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="w-full bg-surface border border-line pl-11 pr-11 py-3.5 text-sm text-ivory placeholder:text-muted focus:border-brass outline-none transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brass p-1"
        >
          <HiX />
        </button>
      )}
    </div>
  );
}
