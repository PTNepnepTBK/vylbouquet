/**
 * Button Component - Komponen button responsive dengan berbagai variant
 * @param {string} variant - Tipe button: 'primary', 'secondary', 'success', 'danger', 'outline'
 * @param {string} size - Ukuran button: 'sm', 'md', 'lg'
 * @param {boolean} fullWidth - Button full width atau tidak
 * @param {ReactNode} children - Konten button
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  ...props 
}) {
  // Base class - styling dasar untuk semua button
  const baseClass = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    touch-target
  `.trim().replace(/\s+/g, ' ');
  
  // Variant styles - warna dan style untuk tiap tipe button
  const variants = {
    primary: 'bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white focus:ring-pink-300 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 focus:ring-gray-300',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white focus:ring-green-300 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-300 shadow-sm',
    outline: 'border-2 border-pink-500 text-pink-600 hover:bg-pink-50 active:bg-pink-100 focus:ring-pink-300',
  };

  // Size variants - ukuran padding dan font
  const sizes = {
    sm: 'px-3 py-1.5 text-xs sm:text-sm',
    md: 'px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base',
    lg: 'px-5 py-2.5 sm:px-8 sm:py-3 text-base sm:text-lg',
  };

  // Width class - full width atau auto
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${widthClass}`}
      {...props}
    >
      {children}
    </button>
  );
}
