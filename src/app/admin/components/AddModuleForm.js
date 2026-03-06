"use client"

export default function AddModuleForm({ heading, subHeading, onHeadingChange, onSubHeadingChange, onSubmit, onClose }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-green-500">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-gray-800">Add New Module</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Module Heading</label>
          <input
            type="text"
            placeholder="Enter heading"
            value={heading}
            onChange={onHeadingChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Sub-Heading</label>
          <input
            type="text"
            placeholder="Enter sub-heading"
            value={subHeading}
            onChange={onSubHeadingChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-xs sm:text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-xs sm:text-sm"
          >
            Save Module
          </button>
        </div>
      </div>
    </div>
  )
}