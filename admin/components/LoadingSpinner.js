export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3">{message}</span>
    </div>
  )
}