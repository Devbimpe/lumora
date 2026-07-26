"use client";
import { useState } from "react";
import { api, apiErrorMessage } from "@/app/_lib/api-client";

export default function SectionManager({ selectedModule, sections = [], onSectionsChange, onError }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshSections = async () => {
    const data = await api
      .get("/api/admin/sections", { searchParams: { moduleId: selectedModule } })
      .json();

    onSectionsChange(Array.isArray(data) ? data : []);
  };

  const createSection = async () => {
    if (!title.trim()) {
      onError("Section title is required");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post("/api/admin/sections", {
        json: {
          moduleId: selectedModule,
          title: title.trim(),
          description: description.trim(),
        },
      });

      setTitle("");
      setDescription("");
      await refreshSections();
    } catch (err) {
      onError(await apiErrorMessage(err, "Failed to create section"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (section) => {
    setEditingSectionId(section.sectionId);
    setEditTitle(section.title || "");
    setEditDescription(section.description || "");
  };

  const cancelEdit = () => {
    setEditingSectionId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const saveEdit = async (sectionId) => {
    if (!editTitle.trim()) {
      onError("Section title is required");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.put("/api/admin/sections", {
        json: {
          moduleId: selectedModule,
          sectionId,
          title: editTitle.trim(),
          description: editDescription.trim(),
        },
      });

      cancelEdit();
      await refreshSections();
    } catch (err) {
      onError(await apiErrorMessage(err, "Failed to update section"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSection = async (sectionId) => {
    const confirmed = window.confirm(
      "Delete this section? Content pages and knowledge checks assigned to it may become unassigned."
    );

    if (!confirmed) return;

    try {
      setIsSubmitting(true);

      await api.delete("/api/admin/sections", {
        json: {
          moduleId: selectedModule,
          sectionId,
        },
      });

      await refreshSections();
    } catch (err) {
      onError(await apiErrorMessage(err, "Failed to delete section"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-purple-500">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Sections</h2>
        <p className="text-sm text-gray-500">
          Sections group content pages and knowledge checks inside this module.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Section title"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional section introduction"
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

        <button
          onClick={createSection}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Add Section"}
        </button>
      </div>

      {sections.length > 0 ? (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div key={section.sectionId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              {editingSectionId === section.sectionId ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />

                  <textarea
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => saveEdit(section.sectionId)}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                      Section {index + 1}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{section.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(section)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSection(section.sectionId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No sections yet. Add a section to switch this module into section-based organization.
        </p>
      )}
    </div>
  );
}