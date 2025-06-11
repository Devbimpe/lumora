export function Button({ children, className, ...props }) {
  return (
    <button
      className={`px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  )
}