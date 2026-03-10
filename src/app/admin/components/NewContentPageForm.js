"use client";
import { useState } from 'react';

export default function NewContentPageForm({
  selectedModule,
  onClose,
  onCreated,
  onError,
  // Image state & handlers live in the parent because they're shared with the inline edit form
  imageFile,
  imageSrc,
  imageDescription,
  uploadedImageURL,
  uploadingImage,
  setImageFile,
  setImageSrc,
  setImageDescription,
  setUploadedImageURL,
  onImageFileChange,
  onUploadImage,
  onDeleteImage,
  // URL upload helpers
  inputIsURL,
  onURLChange,
  onUploadURLImage,
  onResetURLState,
}) {
  const [newOverview, setNewOverview] = useState('');
  const [newReading, setNewReading] = useState('');
  const [showCreatePreview, setShowCreatePreview] = useState(false);

  const createNewContent = async () => {
    if (!newOverview.trim()) {
      onError('Overview (heading) is required');
      return;
    }
    if (!newReading.trim() && !uploadedImageURL) {
      onError('Either Reading content or an uploaded Image is required');
      return;
    }

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: selectedModule,
          overview: newOverview,
          reading: uploadedImageURL ? '' : newReading,
          imageURL: uploadedImageURL || null,
          imageDescription: uploadedImageURL ? imageDescription : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create content");

      const updatedContent = await fetch(`/api/content?moduleId=${selectedModule}`);
      const data = await updatedContent.json();
      onCreated(data);

      setNewOverview("");
      setNewReading("");
      setShowCreatePreview(false);
      onClose();
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-green-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          New Content Page for Module {selectedModule}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Heading (Overview)
          </label>
          <textarea
            placeholder="Enter the heading for this content page"
            value={newOverview}
            onChange={(e) => setNewOverview(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content (Reading Material or Image)
          </label>
          {imageSrc ? (
            <div className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50">
              <img
                src={imageSrc}
                alt="Uploaded content"
                className="rounded-lg max-w-full"
                style={{ maxHeight: "400px", objectFit: "contain" }}
              />
              {!uploadedImageURL && imageFile && (
                <button
                  onClick={() => onUploadImage(() => setNewReading(''))}
                  disabled={uploadingImage}
                  className="mt-3 mr-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
              {/* Accept uploaded URL, preview image */}
              {!uploadedImageURL && inputIsURL && (
                <button
                  onClick={() => onUploadURLImage(() => setNewReading(''))}
                  disabled={uploadingImage || !inputIsURL}
                  className="mt-3 mr-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
              {!uploadedImageURL && (
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImageSrc(null);
                    setUploadedImageURL(null);
                    onResetURLState?.();
                  }}
                  className="mt-3 mr-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium text-sm"
                >
                  Remove Image
                </button>
              )}
              {uploadedImageURL && (
                <button
                  onClick={onDeleteImage}
                  disabled={uploadingImage}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm"
                >
                  {uploadingImage ? 'Deleting...' : 'Delete Image'}
                </button>
              )}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Description / Presenter's Notes</label>
                <textarea
                  placeholder="Add a description or notes for this image..."
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  rows="3"
                />
              </div>
            </div>
          ) : (
            <textarea
              placeholder="Enter the main content for this page"
              value={newReading}
              onChange={(e) => setNewReading(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="8"
            />
          )}
        </div>

        {/* Image Upload */}
        {!imageSrc && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="file_input">
              Or Upload an Image Instead
            </label>
            <input
              type="file"
              className="cursor-pointer px-4 py-3 mr-2 border border-gray-300 rounded-lg"
              accept="image/png, image/jpeg"
              name="imageInput"
              id="file_input"
              onChange={onImageFileChange}
            />
            <button
              onClick={() => onUploadImage(() => setNewReading(''))}
              disabled={uploadingImage || !imageFile}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${
                uploadingImage || !imageFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        )}

        {/* Image Upload Using URL */}
        {!imageSrc && (
          <div>
            <input
              type="url"
              className="cursor-edit w-[328px] px-4 py-3 mr-2 border border-gray-300 rounded-lg"
              name="urlInput"
              id="url_input"
              placeholder="Paste URL here"
              onChange={onURLChange}
            />
            <button
              onClick={() => onUploadURLImage(() => setNewReading(''))}
              disabled={uploadingImage || !inputIsURL}
              className={`w-full sm:w-auto px-6 sm:px-8 py-2 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${
                uploadingImage || !inputIsURL
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploadingImage ? 'Uploading...' : 'Upload URL'}
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowCreatePreview((prev) => !prev)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            {showCreatePreview ? "Hide Preview" : "Preview"}
          </button>
          <button
            onClick={createNewContent}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            Save Page
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>

        {showCreatePreview && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Preview</h4>
            <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">
              {newOverview || "Untitled page"}
            </h5>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap break-words">
              {newReading || "No content to preview."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
