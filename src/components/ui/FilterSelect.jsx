"use client";

/**
 * FilterSelect - Reusable dropdown filter component
 * @param {string} label - Label text displayed before the select
 * @param {string} value - Current selected value
 * @param {function} onChange - Callback when value changes
 * @param {array} options - Array of {label, value} objects for dropdown options
 * @param {string} placeholder - Placeholder text for default option
 */
export default function FilterSelect({
  label = "Filter",
  value = "",
  onChange,
  options = [],
  placeholder = "Semua",
}) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="block px-3 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-pink-500 focus:border-pink-500 
                   text-sm bg-white cursor-pointer min-w-[120px]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
