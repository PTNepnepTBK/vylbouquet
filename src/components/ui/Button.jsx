export default function Button({ children, variant = 'primary', ...props }) {
  const baseClass = 'px-6 py-2 rounded-lg font-semibold transition-colors';
  
  const variants = {
    primary: 'bg-primary hover:bg-pink-600 text-white',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button 
      className={`${baseClass} ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
