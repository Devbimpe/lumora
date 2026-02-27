"use client"

import React from "react"

export default function ModuleRow({
  module,
  isExpanded,
  heading,
  subHeading,
  onHeadingChange,
  onSubHeadingChange,
  onEdit,
  onDelete,
  onPublishToggle,
  onSubmit,
  onModuleClick,
  onClose,
  // Reorder mode props
  isReordering,
  onDragStart,
  onDragOver,
  onDrop,
  isDraggedOver,
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 ${
        isReordering ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDraggedOver ? "border-t-4 border-green-500" : ""}`}
      draggable={isReordering}
      onDragStart={isReordering ? onDragStart : undefined}
      onDragOver={isReordering ? onDragOver : undefined}
      onDrop={isReordering ? onDrop : undefined}
    >
      {/* Edit Form - hidden during reorder mode */}
      {isExpanded && !isReordering && (
        <div className="p-4 sm:p-6 bg-green-50 border-b border-green-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Edit Module {module.id}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Heading</label>
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
            <div className="flex gap-2 flex-wrap">
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
                Update
              </button>
              {/* Go to content editing for this module. */}
              <button
                onClick={() => onModuleClick(module.id)}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-xs sm:text-sm"
              >
                Edit Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Display */}
      {/* Keep card click disabled so navigation happens only from action buttons. */}
      <div
        className={`p-4 sm:p-6 transition-colors duration-200 ${isReordering ? "select-none" : "hover:bg-gray-50 cursor-pointer group relative"
          }`}
        onClick={isReordering ? undefined : () => onModuleClick(module.id)}
      >
        <div className="flex items-center gap-3">
          {/* Drag handle - only visible in reorder mode */}
          {isReordering && (
            <div className="flex-shrink-0 text-gray-400">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="9" cy="5" r="1.5" />
                <circle cx="15" cy="5" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="15" cy="19" r="1.5" />
              </svg>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full flex-shrink-0">
                Module {module.id}
              </span>
              {module.published && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-green-600">Published</span>
              )}
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 break-words">
              {module.Heading}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 break-words">{module.SubHeading}</p>
          </div>

          {/* Action Buttons - Consolidated styling */}
          {!isReordering && (
            <div className="flex flex-col sm:flex-row gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPublishToggle(module.id, module.published)
                }}
                className={`w-full sm:w-auto text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                  module.published
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {module.published ? "Unpublish" : "Publish"}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(module.id)
                }}
                className="w-full sm:w-auto bg-blue-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="w-full sm:w-auto bg-red-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}