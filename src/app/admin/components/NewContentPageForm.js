"use client";
import { useState } from 'react';

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function NewContentPageForm({ selectedModule, onClose, onCreated, onError }) {
  const [newOverview, setNewOverview] = useState('');
  const [newReading, setNewReading] = useState('');
  const [showCreatePreview, setShowCreatePreview] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageDescription, setImageDescription] = useState('');
  const [uploadedImageURL, setUploadedImageURL] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploadedAsset, setIsUploadedAsset] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const inputIsURL = isValidHttpUrl(imageUrlInput.trim());

  const setFileFromInput = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setUploadedImageURL(null);
    setImageUrlInput('');
    setIsUploadedAsset(false);
    setImageSrc(URL.createObjectURL(file));
  };

  const resetImageState = () => {
    setImageFile(null);
    setImageSrc(null);
    setUploadedImageURL(null);
    setImageDescription('');
    setImageUrlInput('');
    setIsUploadedAsset(false);
  };

  const handleClose = () => {
    resetImageState();
    onClose();
  };

  function handleImageFileChange(event) {
    const file = event.target.files[0];
    setFileFromInput(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer?.files?.[0];
    setFileFromInput(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  const useImageUrl = (onClearReading) => {
    const trimmedUrl = imageUrlInput.trim();
    if (!isValidHttpUrl(trimmedUrl)) {
      onError('Please enter a valid image URL');
      return;
    }

    setImageFile(null);
    setUploadedImageURL(trimmedUrl);
    setImageSrc(trimmedUrl);
    setIsUploadedAsset(false);
    onClearReading?.();
  };

  const uploadImage = async (onClearReading) => {
    if (!imageFile) {
      onError('Please select an image file first');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', imageFile);

      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Upload failed');
      }

      setUploadedImageURL(data.url);
      setImageSrc(data.url);
      setImageFile(null);
      setIsUploadedAsset(true);
      onClearReading?.();
    } catch (err) {
      onError(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteImage = async () => {
    if (!uploadedImageURL) {
      return;
    }

    if (!isUploadedAsset) {
      resetImageState();
      return;
    }

    try {
      setUploadingImage(true);
      const res = await fetch(`/api/admin/upload-image?imageUrl=${encodeURIComponent(uploadedImageURL)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Delete failed');
      }

      resetImageState();
    } catch (err) {
      onError(`Image delete failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const createNewContent = async () => {
    if (!newOverview.trim()) {
      onError('Overview (heading) is required');
      return;
    }
    if (!newReading.trim() && !uploadedImageURL) {
      onError('Either Reading content or an uploaded image is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModule,
          overview: newOverview,
          reading: newReading,
          imageURL: uploadedImageURL || null,
          imageDescription: uploadedImageURL ? imageDescription : null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create content');
      }

      const updatedContent = await fetch(`/api/content?moduleId=${selectedModule}`);
      const data = await updatedContent.json();
      onCreated(data);

      setNewOverview('');
      setNewReading('');
      setShowCreatePreview(false);
      handleClose();
    } catch (err) {
      onError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-green-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">New Content Page for Module {selectedModule}</h3>
        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Page Heading (Overview)</label>
          <textarea
            placeholder="Enter the heading for this content page"
            value={newOverview}
            onChange={(event) => setNewOverview(event.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
          {/* TEXT ALWAYS AVAILABLE */}
          <textarea
            placeholder="Enter the main content for this page"
            value={newReading}
            onChange={(event) => setNewReading(event.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
            rows="6"
          />
          
          <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Image Content</label>
          {imageSrc && (
            <div className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50">
              <img
                src={imageSrc}
                alt="Uploaded content"
                className="rounded-lg max-w-full"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
              {!uploadedImageURL && imageFile && (
                <button
                  onClick={() => uploadImage()}
                  disabled={uploadingImage}
                  className="mt-3 mr-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
              {!uploadedImageURL && (
                <button
                  onClick={resetImageState}
                  className="mt-3 mr-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium text-sm"
                >
                  Remove Image
                </button>
              )}
              {uploadedImageURL && (
                <button
                  onClick={deleteImage}
                  disabled={uploadingImage}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm"
                >
                  {uploadingImage ? 'Removing...' : isUploadedAsset ? 'Delete Image' : 'Remove Image'}
                </button>
              )}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Description / Presenter's Notes</label>
                <textarea
                  placeholder="Add a description or notes for this image..."
                  value={imageDescription}
                  onChange={(event) => setImageDescription(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>

        {!imageSrc && (
          <div className="mt-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="flex-1 border-t border-gray-200" aria-hidden="true" />
              <span className="text-sm text-gray-600">Upload an image</span>
              <span className="flex-1 border-t border-gray-200" aria-hidden="true" />
            </div>
            <input
              type="file"
              className="sr-only"
              accept="image/jpeg, image/png, image/gif, image/webp, image/bmp"
              name="imageInput"
              id="file_input"
              onChange={handleImageFileChange}
            />
            <label
              htmlFor="file_input"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center w-full min-h-[140px] py-10 px-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors duration-200 text-center ${
                isDragging
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }`}
            >
              {imageFile ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[280px]" title={imageFile.name}>
                    {imageFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      uploadImage();
                    }}
                    disabled={uploadingImage}
                    className={`px-5 py-2 rounded-lg text-white font-medium text-sm transition-colors ${
                      uploadingImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload image'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-0 text-center">
                  <svg className="w-9 h-9 text-gray-400 mb-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">Drag and drop your image here</p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse · JPEG, PNG, GIF, WebP, BMP (max 5 MB)</p>
                </div>
              )}
            </label>

            <div className="mt-4">
              <div className="flex gap-2">
              <input
                type="url"
                className="flex-1 min-w-0 px-3 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                name="urlInput"
                id="url_input"
                placeholder="Paste image URL (e.g. https://…)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => useImageUrl()}
                disabled={uploadingImage || !inputIsURL}
                className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  uploadingImage || !inputIsURL
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-900'
                }`}
              >
                Upload
              </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <button
            onClick={() => setShowCreatePreview((prev) => !prev)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            {showCreatePreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={createNewContent}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Page'}
          </button>
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>

        {showCreatePreview && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Preview</h4>
            <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 wrap-break-word">
              {newOverview || 'Untitled page'}
            </h5>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap wrap-break-word">
              {newReading || (uploadedImageURL ? 'Image selected for this page (see edit view).' : 'No content to preview.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
