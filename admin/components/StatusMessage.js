export default function StatusMessage({ message }) {
  if (!message) return null

  return (
    <div
      className={`mb-4 p-3 rounded-md text-center ${
        message.includes("✅")
          ? "bg-green-100 text-green-800"
          : message.includes("❌")
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800"
      }`}
    >
      {message}
    </div>
  )
}