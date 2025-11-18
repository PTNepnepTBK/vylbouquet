/**
 * Input Component - Komponen input responsive dengan label dan error handling
 * @param {string} label - Label untuk input field
 * @param {string} error - Pesan error yang ditampilkan
 * @param {string} helperText - Teks bantuan di bawah input
 * @param {ReactNode} icon - Icon yang ditampilkan di kiri input
 * @param {string} size - Ukuran input: 'sm', 'md', 'lg'
 */
export default function Input({ 
  label, 
  error, 
  helperText,
  icon: Icon,
  size = 'md',
  ...props 
}) {
  // Size variants untuk input
  const sizes = {
    sm: 'px-3 py-1.5 text-xs sm:text-sm',
    md: 'px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base',
    lg: 'px-4 py-2.5 sm:px-5 sm:py-3 text-base sm:text-lg',
  };

  // Icon padding jika ada icon
  const iconPadding = Icon ? 'pl-10 sm:pl-11' : '';

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input wrapper - untuk icon positioning */}
      <div className="relative">
        {/* Icon - Absolute positioned di kiri */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
        )}
        
        {/* Input field */}
        <input 
          className={`
            w-full border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400
            disabled:bg-gray-100 disabled:cursor-not-allowed
            touch-target
            ${sizes[size]}
            ${iconPadding}
            ${error 
              ? 'border-red-400 focus:ring-red-300 focus:border-red-400' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />
      </div>
      
      {/* Helper text atau Error message */}
      {error && (
        <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
