"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

/**
 * SearchBar - Reusable search input component with debounce
 * @param {string} value - Current search value
 * @param {function} onChange - Callback when search value changes (debounced)
 * @param {string} placeholder - Placeholder text
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 500)
 */
export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Cari...",
  debounceMs = 500,
}) {
  const [localValue, setLocalValue] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange && localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  return (
    <div className="relative flex-1 min-w-[200px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-pink-500 focus:border-pink-500 
                   placeholder-gray-400 text-sm"
      />
    </div>
  );
}
