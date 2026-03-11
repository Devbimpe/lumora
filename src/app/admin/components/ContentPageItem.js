"use client";
import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

export default function ContentPageItem({ item, index, selectedModule, onContentChange, onError }) {
  // MARK: Edit State
  const [editing, setEditing] = useState(false);
  const [editOverview, setEditOverview] = useState("");
  const [editReading, setEditReading] = useState("");
  const [editImageDescription, setEditImageDescription] = useState('');
  const [showEditPreview, setShowEditPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MARK: Image State
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageDescription, setImageDescription] = useState('');
  const [uploadedImageURL, setUploadedImageURL] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // MARK: Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // MARK: Edit Handlers
  const startEdit = () => {
    setEditing(true);
    setEditOverview(item.Overview);
    setEditReading(item.Reading || '');
    setEditImageDescription(item.ImageDescription || '');
    setShowEditPreview(false);
    setImageSrc(item.ImageURL || null);
    setUploadedImageURL(item.ImageURL || null);
    setImageFile(null);
    setImageDescription(item.ImageDescription || '');
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditOverview("");
    setEditReading("");
    setEditImageDescription('');
    setShowEditPreview(false);
    setImageSrc(null);
    setUploadedImageURL(null);
    setImageFile(null);
    setImageDescription('');
  };

  const saveEdit = async () => {
    try {
      setIsSubmitting(true);
      console.log('Saving content with values:', { editOverview, editReading, uploadedImageURL, imageDescription });
      const res = await fetch(`/api/content/${selectedModule}/${item.ContentID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Overview: editOverview,
          Reading: uploadedImageURL ? '' : editReading,
          imageURL: uploadedImageURL || null,
          imageDescription: uploadedImageURL ? editImageDescription : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update content");

      const updatedRes = await fetch(`/api/content?moduleId=${selectedModule}`);
      const data = await updatedRes.json();
      console.log('Fetched updated content after edit:', data);
      onContentChange(data);
      window.dispatchEvent(new Event('content-updated'));
      cancelEdit();
    } catch (err) {
      onError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // MARK: Delete Handler
  const performDelete = async () => {
    try {
      const res = await fetch(`/api/content/${selectedModule}/${item.ContentID}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete content");

      const updatedContent = await fetch(`/api/content?moduleId=${selectedModule}`);
      const data = await updatedContent.json();
      onContentChange(data);
      window.dispatchEvent(new Event('content-updated'));
    } catch (err) {
      onError(err.message);
    } finally {
      setDeleteModalOpen(false);
    }
  };

  // MARK: Image Handlers
  function handleImageFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setUploadedImageURL(null);
      setImageSrc(URL.createObjectURL(file));
    }
  }

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
      if (!res.ok) throw new Error(data.details || data.error || 'Upload failed');
      setUploadedImageURL(data.url);
      setImageSrc(data.url);
      onClearReading?.();
    } catch (err) {
      onError(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteImage = async () => {
    if (!uploadedImageURL) return;
    try {
      setUploadingImage(true);
      const res = await fetch(`/api/admin/upload-image?imageUrl=${encodeURIComponent(uploadedImageURL)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Delete failed');

      // If editing an existing item, also clear the image from the DB record
      if (editing) {
        await fetch(`/api/content/${item.ContentID}/${selectedModule}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Overview: editOverview, Reading: editReading, imageURL: null, imageDescription: null }),
        });
        const updatedRes = await fetch(`/api/content?moduleId=${selectedModule}`);
        const contentData = await updatedRes.json();
        onContentChange(contentData);
        window.dispatchEvent(new Event('content-updated'));
      }

      setImageFile(null);
      setImageSrc(null);
      setUploadedImageURL(null);
      setImageDescription('');
    } catch (err) {
      onError(`Image delete failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // MARK: Render
  return (
    <>
    <div id={`content-page-${item.ContentID}`} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      {editing ? (
        // Edit Mode
                <div className="p-6 bg-green-50 border-l-4 border-green-500">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Editing Page {index + 1}</h3>
                    <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Heading (Overview)</label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={editOverview}
                        onChange={(e) => setEditOverview(e.target.value)}
                        rows="2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content (Reading Material or Image)</label>
                      {imageSrc ? (
                        <div className="w-full border border-gray-300 rounded-lg p-4 bg-gray-50">
                          <img src={imageSrc} alt="Current content image" className="rounded-lg max-w-full" style={{ maxHeight: "400px", objectFit: "contain" }} />
                          {!uploadedImageURL && imageFile && (
                            <button onClick={() => uploadImage(() => setEditReading(''))} disabled={uploadingImage} className="mt-3 mr-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm">
                              {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </button>
                          )}
                          {!uploadedImageURL && (
                            <button onClick={() => { setImageFile(null); setImageSrc(null); setUploadedImageURL(null); }} className="mt-3 mr-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium text-sm">
                              Remove Image
                            </button>
                          )}
                          {uploadedImageURL && (
                            <button onClick={deleteImage} disabled={uploadingImage} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm">
                              {uploadingImage ? 'Deleting...' : 'Delete Image'}
                            </button>
                          )}
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Description / Presenter's Notes</label>
                            <textarea
                              placeholder="Add a description or notes for this image..."
                              value={editImageDescription}
                              onChange={(e) => setEditImageDescription(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                              rows="3"
                            />
                          </div>
                        </div>
                      ) : (
                        <textarea
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={editReading}
                          onChange={e => setEditReading(e.target.value)}
                          rows="8"
                        />
                      )}
                    </div>
                    {/* Image upload for editing - only shown when no image */}
                    {!imageSrc && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={`edit_file_input_${item.ContentID}`}>Or Upload an Image Instead</label>
                        <input
                          type="file"
                          className="cursor-pointer px-4 py-3 mr-2 border border-gray-300 rounded-lg"
                          accept="image/jpeg, image/png, image/gif, image/webp, image/bmp"
                          id={`edit_file_input_${item.ContentID}`}
                          onChange={handleImageFileChange}
                        />
                        <button
                          onClick={() => uploadImage(() => setEditReading(''))}
                          disabled={uploadingImage || !imageFile}
                          className={`w-full sm:w-auto px-4 sm:px-6 py-2 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base ${uploadingImage || !imageFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base" onClick={() => setShowEditPreview((prev) => !prev)}>
                        {showEditPreview ? "Hide Preview" : "Preview"}
                      </button>
                      <button className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed" onClick={saveEdit} disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save changes"}
                      </button>
                      <button className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                    {showEditPreview && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Preview</h4>
                        <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">{editOverview || "Untitled page"}</h5>
                        <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap break-words">{editReading || "No content to preview."}</p>
                      </div>
                    )}
                  </div>
                </div>
      ) : (
                // View Mode
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Page {index + 1}</span>
                        <span className="text-xs sm:text-sm text-gray-500">Module {item.ModuleID}</span>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 break-words">{item.Overview}</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium" onClick={startEdit}>Edit</button>
                      <button className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium" onClick={() => setDeleteModalOpen(true)}>Delete Page</button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-green-400">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Content:</h4>
                    {item.ImageURL ? (
                      <div>
                        <img src={item.ImageURL} alt={`Image for ${item.Overview}`} className="rounded-lg border border-gray-200" style={{ maxWidth: "300px" }} />
                        {item.ImageDescription && (<p className="mt-2 text-xs sm:text-sm text-gray-600 italic">{item.ImageDescription}</p>)}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{item.Reading}</p>
                    )}
                  </div>
                </div>
      )}
    </div>

    <ConfirmationModal
      isOpen={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      onConfirm={performDelete}
      title="Delete Content"
      message={`Are you sure you want to delete "${item.Overview}"? This action cannot be undone and will permanently remove this content page.`}
      confirmText="Delete Content"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
}
