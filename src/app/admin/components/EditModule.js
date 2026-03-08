"use client"
import { useState, useEffect, useRef } from "react"
import { FAVICON_URLS, getFaviconIdFromUrl } from "../../lib/favicons"

const FIRST_FAVICON_ID = Object.keys(FAVICON_URLS)[0]

function resolveInitialId(initialFaviconUrl, initialFaviconId) {
  const fromUrl = initialFaviconUrl ? getFaviconIdFromUrl(initialFaviconUrl) : null
  if (fromUrl) return String(fromUrl)
  if (initialFaviconId != null && FAVICON_URLS[initialFaviconId]) return String(initialFaviconId)
  return FIRST_FAVICON_ID
}

export default function EditModule({ heading, subHeading, onHeadingChange, onSubHeadingChange, onSubmit, onClose, isNew, onFaviconChange, initialFaviconId, initialFaviconUrl }) {
  const [selectedFaviconId, setSelectedFaviconId] = useState(
    () => resolveInitialId(initialFaviconUrl, initialFaviconId)
  )
  const lastSyncedUrl = useRef(initialFaviconUrl)

  // Sync only when parent passes a different initial URL (e.g. switched module), not on every re-render
  useEffect(() => {
    if (initialFaviconUrl === lastSyncedUrl.current) return
    lastSyncedUrl.current = initialFaviconUrl
    const id = resolveInitialId(initialFaviconUrl, initialFaviconId)
    setSelectedFaviconId(id)
  }, [initialFaviconUrl, initialFaviconId])

  function handleFaviconChange(faviconId, event) {
    setSelectedFaviconId(String(faviconId))
    if (onFaviconChange) onFaviconChange(FAVICON_URLS[faviconId], faviconId)
    if (event?.currentTarget) event.currentTarget.blur()
  }


  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-green-500">

      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-gray-800 text-center">{isNew ? 'Create New Module' : 'Edit Module'}</h3>
          <div id="FaviconSelector" className="flex flex-wrap items-center gap-3 ml-3">
            {Object.entries(FAVICON_URLS).map(([id, url]) => (
              <button
                key={id}
                type="button"
                className={`p-2 rounded-full focus:outline-none transition-colors duration-200 ${
                  selectedFaviconId === String(id)
                    ? "bg-green-100 ring-2 ring-green-500 ring-offset-2"
                    : "hover:bg-gray-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                }`}
                onClick={(e) => handleFaviconChange(id, e)}
              >
                <img src={url} alt={`Module ${id}`} className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>

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
        <div className="flex flex-col sm:flex-row gap-2">
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