"use client"

export default function AddModuleForm({ heading, subHeading, onHeadingChange, onSubHeadingChange, onSubmit, onClose }) {
  return (
    <div className="bg-[#fed5ab] shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Add New Module</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
          ×
        </button>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="HEADING"
          value={heading}
          onChange={onHeadingChange}
          className="w-full px-4 py-2 border rounded-md placeholder:text-center bg-white"
        />
        <input
          type="text"
          placeholder="SUB-HEADING"
          value={subHeading}
          onChange={onSubHeadingChange}
          className="w-full px-4 py-2 border rounded-md placeholder:text-center bg-white"
        />
        <div className="flex justify-end">
          <button onClick={onSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Save Module
          </button>
        </div>
      </div>
    </div>
  )
}