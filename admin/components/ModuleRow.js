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
  onSubmit,
  onModuleClick,
}) {
  return (
    <React.Fragment>
      {isExpanded && (
        <tr>
          <td colSpan="2" className="p-4">
            <div className="bg-[#fed5ab] shadow p-4">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="bg-gray-200 px-2 py-3">
                      <input
                        type="text"
                        placeholder="HEADING"
                        value={heading}
                        onChange={onHeadingChange}
                        className="w-full px-2 py-1 placeholder:text-center"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="h-2"></td>
                  </tr>
                  <tr>
                    <td className="bg-gray-200 px-2 py-1">
                      <input
                        type="text"
                        placeholder="SUB-HEADING"
                        value={subHeading}
                        onChange={onSubHeadingChange}
                        className="w-full px-2 placeholder:text-center"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-end">
                <button onClick={onSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Update Module
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
      <tr
        className="bg-[#dbf2e0] hover:scale-105 transition-transform duration-200 relative group cursor-pointer"
        onClick={() => onModuleClick(module.id)}
      >
        <td className="py-6 px-4 text-2xl">MODULE {module.id}:</td>
        <td className="py-6 px-4 text-2xl relative">
          {module.Heading}
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(module.id)
              }}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(module.id)
              }}
              className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      <tr>
        <td colSpan="2" className="h-4"></td>
      </tr>
    </React.Fragment>
  )
}