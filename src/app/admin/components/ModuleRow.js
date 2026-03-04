"use client"

import React from "react"

export default function ModuleRow({
  module,
  onEdit,
  onDelete,
  onPublishToggle,
  // Reorder mode props
  isReordering,
  onDragStart,
  onDragOver,
  onDrop,
  isDraggedOver,
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 ${isReordering ? "cursor-grab active:cursor-grabbing" : ""
        } ${isDraggedOver ? "border-t-4 border-green-500" : ""}`}
      draggable={isReordering}
      onDragStart={isReordering ? onDragStart : undefined}
      onDragOver={isReordering ? onDragOver : undefined}
      onDrop={isReordering ? onDrop : undefined}
    >
      {/* Module Display */}
      <div
        className={`p-4 sm:p-6 transition-colors duration-200 ${isReordering ? "select-none" : "group relative"
          }`}
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
                className={`w-full sm:w-auto text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${module.published
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
                  onDelete(module.id);
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