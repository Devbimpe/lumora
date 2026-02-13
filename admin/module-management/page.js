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

  const performDelete = async () => {
    const { moduleId } = deleteModal;

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
    router.push(`/admin/content?moduleId=${id}`);
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
          {/* Add Module Button */}
          <div className="mb-4 sm:mb-6">
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
          </div>

          {/* Modules List */}
          <div className="space-y-3 sm:space-y-4">
            {modules.length > 0 ? (
              modules.map((module) => (
                <ModuleRow
                  key={module.id}
                  module={module}
                  onEdit={() => router.push(`/admin/content?moduleId=${module.id}`)}
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
        onClose={() =>
          setDeleteModal({ isOpen: false, moduleId: null, moduleName: "" })
        }
        onConfirm={performDelete}
        title="Delete Module"
        message={`Are you sure you want to delete "${deleteModal.moduleName}"? This action cannot be undone and will permanently remove the module and all its content.`}
        confirmText="Delete Module"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
