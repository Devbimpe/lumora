"use client"

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div className="flex">
        <div className="text-red-500 font-bold mr-2">Error:</div>
        <div>{error}</div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
          Try Again
        </button>
      )}
    </div>
  )
}