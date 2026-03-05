export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
      <span className="text-gray-600 text-lg font-medium">{message}</span>
    </div>
  )
}