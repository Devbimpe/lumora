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

  const inputIsURL = isValidHttpUrl(imageUrlInput.trim());

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
    if (file) {
      setImageFile(file);
      setUploadedImageURL(null);
      setImageUrlInput('');
      setIsUploadedAsset(false);
      setImageSrc(URL.createObjectURL(file));
    }
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
          reading: uploadedImageURL ? '' : newReading,
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Content (Reading Material or Image)</label>
          {imageSrc ? (
            <div className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50">
              <img
                src={imageSrc}
                alt="Uploaded content"
                className="rounded-lg max-w-full"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
              {!uploadedImageURL && imageFile && (
                <button
                  onClick={() => uploadImage(() => setNewReading(''))}
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
          ) : (
            <textarea
              placeholder="Enter the main content for this page"
              value={newReading}
              onChange={(event) => setNewReading(event.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="8"
            />
          )}
        </div>

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
              onChange={handleImageFileChange}
            />
            <button
              onClick={() => uploadImage(() => setNewReading(''))}
              disabled={uploadingImage || !imageFile}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${
                uploadingImage || !imageFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        )}

        {!imageSrc && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="url_input">
              Or Use an Existing Image URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                name="urlInput"
                id="url_input"
                placeholder="Paste image URL here"
                value={imageUrlInput}
                onChange={(event) => setImageUrlInput(event.target.value)}
              />
              <button
                onClick={() => useImageUrl(() => setNewReading(''))}
                disabled={uploadingImage || !inputIsURL}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${
                  uploadingImage || !inputIsURL ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Use URL
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
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
              {newReading || (uploadedImageURL ? 'Image selected for this page.' : 'No content to preview.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
