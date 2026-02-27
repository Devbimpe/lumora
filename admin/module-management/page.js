"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import StatusMessage from "../components/StatusMessage";
import ModuleRow from "../components/ModuleRow";
import AddModuleForm from "../components/AddModuleForm";
import ConfirmationModal from "../components/ConfirmationModal";

export default function ModuleManagementPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [heading, setHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const router = useRouter();

  // Reorder mode state
  const [isReordering, setIsReordering] = useState(false);
  const [reorderedModules, setReorderedModules] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);

  // Modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    moduleId: null,
    moduleName: "",
  });

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/modules");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load modules");
      }
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!heading.trim() || !subHeading.trim()) {
      setSubmitStatus("Both fields are required.");
      return;
    }

    try {
      setSubmitStatus(expandedModuleId === "new" ? "Saving..." : "Updating...");
      const isNew = expandedModuleId === "new";
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

  const handleDeleteClick = (id) => {
    const module = modules.find((m) => m.id === id);
    const moduleName = module?.heading || module?.subHeading || "this module";

    setDeleteModal({
      isOpen: true,
      moduleId: id,
      moduleName,
    });
  };

  const performDelete = async (moduleId) => {
    try {
      const response = await fetch("/api/admin/modules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: moduleId }),
      });

      if (!response.ok) throw new Error("Failed to delete module");

      await fetchModules();
      setSubmitStatus("Module deleted successfully!");
      setTimeout(() => setSubmitStatus(""), 3000);
    } catch (error) {
      console.error("Delete error:", error);
      setSubmitStatus("Delete failed");
      setTimeout(() => setSubmitStatus(""), 3000);
    }
  };

  const handleModuleClick = (id) => {
    // Open content page for the selected module.
    router.push(`/admin/content?moduleId=${id}`);
  };

  // --- Reorder mode handlers ---

  const enterReorderMode = () => {
    // Take a snapshot of current modules so we can rearrange locally
    setReorderedModules([...modules]);
    setIsReordering(true);
    setExpandedModuleId(null); // close any open forms
    setHeading("");
    setSubHeading("");
  };

  const cancelReorder = () => {
    setIsReordering(false);
    setReorderedModules([]);
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const saveReorder = async () => {
    try {
      setSubmitStatus("Saving new order...");

      // Build the order array - just the moduleIds in their new positions
      const newOrder = reorderedModules.map((m) => m.id);

      const response = await fetch("/api/admin/modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save new order");
      }

      // Refresh modules from the server and exit reorder mode
      await fetchModules();
      setIsReordering(false);
      setReorderedModules([]);
      setSubmitStatus("Modules reordered successfully!");
      setTimeout(() => setSubmitStatus(""), 3000);
    } catch (err) {
      console.error("Reorder error:", err);
      setSubmitStatus("Failed to reorder modules");
      setTimeout(() => setSubmitStatus(""), 3000);
    }
  };

  // Drag event handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault(); // needed to allow dropping
    setDraggedOverIndex(index);
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDraggedOverIndex(null);
      return;
    }

    // Move the dragged module to its new position
    const updated = [...reorderedModules];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setReorderedModules(updated);
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  useEffect(() => {
    let isMounted = true;

    const loadModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/admin/modules");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load modules");
        }
        const data = await response.json();
        if (isMounted) {
          setModules(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadModules();

    return () => {
      isMounted = false;
    };
  }, []);

  // Use reorderedModules when in reorder mode, otherwise use the real modules
  const displayedModules = isReordering ? reorderedModules : modules;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
          Module Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Create, edit, and manage training modules
        </p>
      </div>

      <StatusMessage message={submitStatus} />

      {loading && <LoadingSpinner message="Loading modules..." />}

      {error && (
        <ErrorMessage error={error} onRetry={() => window.location.reload()} />
      )}

      {!loading && !error && (
        <div>
          {/* Action Buttons */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
            {!isReordering ? (
              <>
                {/* Normal mode buttons */}
                <button
                  // onClick={() => setExpandedModuleId("new")}
                  // className="w-full sm:w-auto bg-green-600 text-white rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                  onClick={() => router.push("/admin/content?mode=new")}
                  className="w-full sm:w-auto bg-green-600 text-white rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add New Module
                </button>

                {/* Only show reorder button if there are at least 2 modules */}
                {modules.length >= 2 && (
                  <button
                    onClick={enterReorderMode}
                    className="w-full sm:w-auto bg-blue-600 text-white rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                    Reorder Modules
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Reorder mode buttons */}
                <button
                  onClick={saveReorder}
                  className="w-full sm:w-auto bg-green-600 text-white rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Order
                </button>
                <button
                  onClick={cancelReorder}
                  className="w-full sm:w-auto bg-gray-500 text-white rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg hover:bg-gray-600 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* Reorder mode hint */}
          {isReordering && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              Drag and drop Modules to rearrange their order, then click "Save Order" to confirm.
            </div>
          )}

          {/* Add Module Form - hidden during reorder mode */}
          {expandedModuleId === "new" && !isReordering && (
            <AddModuleForm
              heading={heading}
              subHeading={subHeading}
              onHeadingChange={(e) => setHeading(e.target.value)}
              onSubHeadingChange={(e) => setSubHeading(e.target.value)}
              onSubmit={handleSubmit}
              onClose={() => {
                setExpandedModuleId(null);
                setHeading("");
                setSubHeading("");
              }}
            />
          )}

          {/* Modules List */}
          <div className="space-y-3 sm:space-y-4">
            {displayedModules.length > 0 ? (
              displayedModules.map((module, index) => (
                <ModuleRow
                  key={module.id}
                  module={module}
                  onEdit={() => router.push(`/admin/content?moduleId=${module.id}`)}
                  onDelete={() =>
                    setDeleteModal({
                      isOpen: true,
                      moduleId: module.id,
                      moduleName: module.Heading,
                    })
                  }
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12 sm:h-16 sm:w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                  No modules found. Create your first module!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, moduleId: null, moduleName: "" })}
        onConfirm={() => {
          performDelete(deleteModal.moduleId);
          setDeleteModal({ isOpen: false, moduleId: "", moduleName: "" });
        }}
        title="Delete Module"
        message={`Are you sure you want to delete "${deleteModal.moduleName}"? This action cannot be undone and will permanently remove the module and all its content.`}
        confirmText="Delete Module"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
