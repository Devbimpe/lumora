'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmationModal from '../components/ConfirmationModal';
import EditModule from '@/admin/components/EditModule';


export default function ContentPage() {
  // Read moduleId from URL so the page can open the right module directly.
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedModuleId = searchParams.get('moduleId');
  const moduleId = searchParams.get('moduleId');
  const mode = searchParams.get('mode');
  const [content, setContent] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editOverview, setEditOverview] = useState('');
  const [editReading, setEditReading] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOverview, setNewOverview] = useState('');
  const [newReading, setNewReading] = useState('');
  // const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [heading, setHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const currentModule = modules.find((m) => m.ModuleID.toString() === selectedModule);
  useEffect(() => {
    if (currentModule) {
      setHeading(currentModule.Heading);
      setSubHeading(currentModule.Subheading);
    }
  });
  // when coming from the 'edit' button in mod mgmt, get the mod id to edit the correct one
  useEffect(() => {

    if (mode === "new") {
      setHeading("");
      setSubHeading("");
      setSelectedModule("");
      setLoading(false);
      return;
    }

    if (modules.length === 0) return;

    const moduleToEdit = modules.find(
      (m) => m.ModuleID.toString() === moduleId
    );

    if (moduleToEdit) {
      setHeading(moduleToEdit.Heading);
      setSubHeading(moduleToEdit.Subheading);
      console.log(moduleToEdit);

    }

  }, [mode, moduleId, modules]);


  // Modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    contentId: null,
    contentName: ''
  });

  const handleSubmit = async () => {
    if (!heading.trim() || !subHeading.trim()) {
      setSubmitStatus("Both fields are required.");
      return;
    }

    try {
      setSubmitStatus(expandedModuleId === "new" ? "Saving..." : "Updating...");
      const isNew = selectedModule === "new";
      const method = isNew ? "POST" : "PUT";
      const body = isNew
        ? JSON.stringify({ heading, subHeading })
        : JSON.stringify({ id: expandedModuleId, heading, subHeading });

      const response = await fetch("/api/admin/modules", {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || (isNew ? "Submission failed." : "Update failed.")
        );
      }

      await fetchModules();
      setSubmitStatus(
        isNew ? "Module added successfully!" : "Module updated successfully!"
      );
      setHeading("");
      setSubHeading("");
      setExpandedModuleId(null);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitStatus(err.message);
    }
  };

  // Fetch modules
  useEffect(() => {
    let isMounted = true;

    fetch('/api/modules')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setModules(data);
          if (data.length > 0) {
            // Check if the module from URL exists in the loaded module list.
            const hasRequestedModule = requestedModuleId
              ? data.some((module) => module.ModuleID.toString() === requestedModuleId)
              : false;
            // Use URL module when valid; otherwise use the first module.
            setSelectedModule(
              hasRequestedModule ? requestedModuleId : data[0].ModuleID.toString()
            );
          }
        }
      },)
      .catch(() => {
        if (isMounted) setModules([]);
      });

    return () => {
      isMounted = false;
    };
  }, [requestedModuleId]);

  // Fetch content for selected module
  useEffect(() => {
    if (!selectedModule) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/content?moduleId=${selectedModule}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) setContent(data);
      })
      .catch(err => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedModule]);

  // Start editing
  const startEdit = (item) => {
    setEditingId(item.ContentID);
    setEditOverview(item.Overview);
    setEditReading(item.Reading);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditOverview('');
    setEditReading('');
  };

  // Save edit
  const saveEdit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/content/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Overview: editOverview,
          Reading: editReading,
        }),
      });
      if (!res.ok) throw new Error('Failed to update content');

      // Refresh content
      const updatedRes = await fetch(`/api/content?moduleId=${selectedModule}`);
      const data = await updatedRes.json();
      setContent(data);
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open delete modal
  const handleDeleteClick = (contentId) => {
    const item = content.find(c => c.ContentID === contentId);
    const contentName = item?.Overview || `Item #${contentId}`;

    setDeleteModal({
      isOpen: true,
      contentId,
      contentName
    });
  };

  // Perform delete
  const performDelete = async () => {
    const { contentId } = deleteModal;

    try {
      setLoading(true);
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete content');

      // Refresh content list
      const updatedContent = await fetch(`/api/content?moduleId=${selectedModule}`);
      const data = await updatedContent.json();
      setContent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new content
  const createNewContent = async () => {
    if (!newOverview.trim() || !newReading.trim()) {
      setError('Both Overview and Reading fields are required');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModule,
          overview: newOverview,
          reading: newReading,
        }),
      });

      if (!res.ok) throw new Error('Failed to create content');

      // Refresh content list
      const updatedContent = await fetch(`/api/content?moduleId=${selectedModule}`);
      const data = await updatedContent.json();
      setContent(data);

      // Reset form
      setShowCreateForm(false);
      setNewOverview('');
      setNewReading('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Module Content</h1>
          <p className="text-sm sm:text-base text-gray-600">Create, edit, and manage content pages</p>
        </div>
        <button
          onClick={() => router.push('/admin/module-management')}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base shadow-lg hover:shadow-xl"
        >
          Cancel
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-xs sm:text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}


      {/* basically this should be gone and replaced with the editing */}
      {/* Module Selector and Add Button */}
      {/* do we want to leave this in here or get rid of it cause it might make switching easier but maybe more confusing */}
      {<div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex-1">
            <label htmlFor="module" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Select Module
            </label>
            <div className="relative">
              <select
                id="module"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="block w-full px-3 sm:px-4 py-2 sm:py-3 pr-8 sm:pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer hover:border-gray-400 transition-colors duration-200 font-medium text-gray-900 text-sm sm:text-base"
              >
                {modules.map((mod) => (
                  <option key={mod.ModuleID} value={mod.ModuleID}>
                    Module {mod.ModuleID}: {mod.Heading}
                  </option>
                ))}
              </select>
              {/* Custom dropdown icon */}
              {<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>}
            </div>
            {modules.length > 0 && selectedModule && (
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                {content.length} {content.length === 1 ? 'page' : 'pages'}
              </p>
            )}
          </div>
          <div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full bg-green-600 text-white rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Content Page
            </button>
          </div>
        </div>
      </div>}

      {/*input the code here to edit heading and sub-heading */}
      {(mode === "new" || currentModule) && (
        <EditModule
          module={currentModule}
          heading={heading}
          subHeading={subHeading}
          onHeadingChange={(e) => setHeading(e.target.value)}
          onSubHeadingChange={(e) => setSubHeading(e.target.value)}
          onContentChange={(e) => setContent(e.target.value)}
        />
      )}



      {/* Create New Content Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">New Content Page for Module {selectedModule}</h3>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewOverview('');
                setNewReading('');
              }}
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
                Content (Reading Material)
              </label>
              <textarea
                placeholder="Enter the main content for this page"
                value={newReading}
                onChange={(e) => setNewReading(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="8"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={createNewContent}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base"
              >
                Save Page
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewOverview('');
                  setNewReading('');
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
          <span className="text-gray-600 text-lg font-medium">Loading content...</span>
        </div>
      ) : (
        <div>
          {content.length > 0 ? (
            <div className="space-y-4">
              {content.map((item, index) => (
                <div key={item.ContentID} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {editingId === item.ContentID ? (
                    // Edit Mode
                    <div className="p-6 bg-green-50 border-l-4 border-green-500">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Editing Page {index + 1}</h3>
                        <button
                          onClick={cancelEdit}
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={editOverview}
                            onChange={e => setEditOverview(e.target.value)}
                            rows="2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content (Reading Material)
                          </label>
                          <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={editReading}
                            onChange={e => setEditReading(e.target.value)}
                            rows="8"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base"
                            onClick={saveEdit}
                          >
                            Save changes
                          </button>
                          <button
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                              Page {index + 1}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500">Module {item.ModuleID}</span>
                          </div>
                          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 break-words">{item.Overview}</h3>
                        </div>

                        {/* Action Buttons - Stack on mobile */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                            onClick={() => handleDeleteClick(item.ContentID)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-green-400">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Content:</h4>
                        <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{item.Reading}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-lg mb-2">No content pages found for Module {selectedModule}</p>
              <p className="text-gray-500 text-sm">Click "Add Content Page" to create your first content page.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, contentId: null, contentName: '' })}
        onConfirm={performDelete}
        title="Delete Content"
        message={`Are you sure you want to delete "${deleteModal.contentName}"? This action cannot be undone and will permanently remove this content page.`}
        confirmText="Delete Content"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
