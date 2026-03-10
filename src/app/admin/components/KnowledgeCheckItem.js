"use client";
import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

export default function KnowledgeCheckItem({ kc, index, selectedModule, onKCChange, onError }) {
  // MARK: KC Edit State
  const [editing, setEditing] = useState(false);
  const [editKCQuestion, setEditKCQuestion] = useState("");
  const [editKCChoices, setEditKCChoices] = useState(["", ""]);
  const [editKCAnswer, setEditKCAnswer] = useState("");
  const [editKCExplain, setEditKCExplain] = useState("");
  const [editKCTab, setEditKCTab] = useState("multiple-choice");
  const [editKCDescAnswer, setEditKCDescAnswer] = useState("");
  const [showEditKCPreview, setShowEditKCPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // MARK: KC Edit Handlers
  const startEdit = () => {
    const plainChoices = (Array.isArray(kc.choices) ? kc.choices : []).map((c) => {
      const match = c.match(/^[A-Z]:\s*(.*)/);
      return match ? match[1] : c;
    });
    const isDescriptive = !kc.choices || kc.choices.filter((c) => c.trim()).length === 0;
    setEditing(true);
    setEditKCQuestion(kc.question || "");
    setEditKCChoices(plainChoices.length >= 2 ? plainChoices : ["", ""]);
    setEditKCAnswer(kc.answer || "");
    setEditKCExplain(isDescriptive ? "" : kc.explain || "");
    setEditKCTab(isDescriptive ? "descriptive" : "multiple-choice");
    setEditKCDescAnswer(isDescriptive ? kc.explain || "" : "");
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditKCQuestion("");
    setEditKCChoices(["", ""]);
    setEditKCAnswer("");
    setEditKCExplain("");
    setEditKCTab("multiple-choice");
    setEditKCDescAnswer("");
    setShowEditKCPreview(false);
  };

  const saveEdit = async () => {
    onError(null);
    if (!editKCQuestion.trim()) {
      onError("Question is required");
      return;
    }

    const isDescriptive = editKCTab === "descriptive";
    const filledChoices = editKCChoices.filter((c) => c.trim());

    if (!isDescriptive) {
      if (filledChoices.length < 2) {
        onError("At least 2 choices are required");
        return;
      }
      if (!editKCAnswer) {
        onError("Please select the correct answer");
        return;
      }
    }

    const formattedChoices = isDescriptive
      ? []
      : filledChoices.map((text, i) => `${String.fromCharCode(65 + i)}: ${text}`);

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/knowledge-checks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledgeCheckId: kc.knowledgeCheckId,
          moduleID: selectedModule,
          question: editKCQuestion,
          choices: formattedChoices,
          answer: isDescriptive ? "" : editKCAnswer,
          explain: isDescriptive ? editKCDescAnswer : editKCExplain,
        }),
      });

      if (!res.ok) throw new Error("Failed to update knowledge check");

      const checksRes = await fetch(`/api/knowledge-checks?moduleId=${selectedModule}`);
      const checksData = await checksRes.json();
      onKCChange(Array.isArray(checksData) ? checksData : []);
      cancelEdit();
    } catch (err) {
      onError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // MARK: KC Delete Handler
  const performDelete = async () => {
    try {
      const res = await fetch("/api/knowledge-checks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knowledgeCheckId: kc.knowledgeCheckId, moduleID: selectedModule }),
      });

      if (!res.ok) throw new Error("Failed to delete knowledge check");

      const checksRes = await fetch(`/api/knowledge-checks?moduleId=${selectedModule}`);
      const checksData = await checksRes.json();
      onKCChange(Array.isArray(checksData) ? checksData : []);
    } catch (err) {
      onError(err.message);
    }
  };

  const handleDelete = () => setDeleteModalOpen(true);

  // MARK: Render
  return (
    <>
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {editing ? (
        <div className="p-4 sm:p-6 bg-blue-50 border-l-4 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Editing Check {index + 1}</h3>
            <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
          </div>

          {/* Edit Tab Switcher */}
          <div className="flex border-b border-blue-200 mb-5">
            <button
              onClick={() => setEditKCTab("multiple-choice")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${editKCTab === "multiple-choice" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Multiple Choice
            </button>
            <button
              onClick={() => setEditKCTab("descriptive")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${editKCTab === "descriptive" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              Descriptive
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <textarea
                value={editKCQuestion}
                onChange={(e) => setEditKCQuestion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
              />
            </div>

            {editKCTab === "multiple-choice" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choices</label>
                  {editKCChoices.map((choice, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-700 w-6">{letter}:</span>
                        <input
                          type="text"
                          value={choice}
                          onChange={(e) => {
                            const updated = [...editKCChoices];
                            updated[idx] = e.target.value;
                            setEditKCChoices(updated);
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {editKCChoices.length > 2 && (
                          <button
                            onClick={() => {
                              const updated = editKCChoices.filter((_, i) => i !== idx);
                              setEditKCChoices(updated);
                              setEditKCAnswer("");
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-lg px-2"
                          >
                            X
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => setEditKCChoices([...editKCChoices, ""])} className="mt-1 text-sm text-green-600 hover:text-green-800 font-medium">
                    + Add Choice
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                  <select
                    value={editKCAnswer}
                    onChange={(e) => setEditKCAnswer(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select correct answer</option>
                    {editKCChoices.reduce((opts, choice, idx) => {
                      if (choice.trim()) {
                        const letter = String.fromCharCode(65 + opts.length);
                        opts.push(<option key={letter} value={letter}>{letter}</option>);
                      }
                      return opts;
                    }, [])}
                  </select>
                </div>
              </>
            )}

            {editKCTab === "descriptive" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sample Answer</label>
                <textarea
                  placeholder="Enter a sample or expected answer for grading reference"
                  value={editKCDescAnswer}
                  onChange={(e) => setEditKCDescAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="5"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (optional)</label>
              <textarea
                placeholder={editKCTab === "descriptive" ? "Add any additional notes or context" : "Explain why the correct answer is right"}
                value={editKCExplain}
                onChange={(e) => setEditKCExplain(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => setShowEditKCPreview(prev => !prev)} className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base">
                {showEditKCPreview ? "Hide Preview" : "Preview"}
              </button>
              <button onClick={saveEdit} disabled={isSubmitting} className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed">
                {isSubmitting ? "Saving..." : "Save changes"}
              </button>
              <button onClick={cancelEdit} className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base">
                Cancel
              </button>
            </div>

            {showEditKCPreview && (
              <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Preview</h4>
                <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 break-words">
                  {editKCQuestion || "No question entered"}
                </h5>
                {editKCTab === "multiple-choice" ? (
                  <div className="space-y-2 mb-3">
                    {editKCChoices.filter((c) => c.trim()).length > 0 ? (
                      editKCChoices
                        .filter((c) => c.trim())
                        .map((text, i) => ({ label: String.fromCharCode(65 + i), text }))
                        .map((choice) => (
                          <div key={choice.label} className={`p-2 rounded-lg border text-sm ${editKCAnswer === choice.label ? "border-green-500 bg-green-50 text-green-800" : "border-gray-200 bg-gray-50 text-gray-700"}`}>
                            <span className="font-medium mr-2">{choice.label}:</span>
                            {choice.text}
                            {editKCAnswer === choice.label && <span className="ml-2 text-green-600 text-xs font-semibold">✓ Correct</span>}
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No choices added yet</p>
                    )}
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">Sample Answer:</p>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                      {editKCDescAnswer || <span className="italic text-gray-400">No sample answer entered</span>}
                    </div>
                  </div>
                )}
                {editKCExplain && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">Explanation:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{editKCExplain}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Check {index + 1}</span>
                {(!kc.choices || kc.choices.filter((c) => c.trim()).length === 0) && (
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">Descriptive</span>
                )}
                {kc.choices && kc.choices.filter((c) => c.trim()).length > 0 && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Multiple Choice</span>
                )}
                <span className="text-xs sm:text-sm text-gray-500">Module {kc.moduleID}</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{kc.question}</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={startEdit} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">Edit</button>
              <button onClick={handleDelete} className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium">Delete</button>
            </div>
          </div>

          {(!kc.choices || kc.choices.filter((c) => c.trim()).length === 0) ? (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-purple-400">
              <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Sample Answer:</h4>
              <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                {kc.explain || <span className="italic text-gray-400">No sample answer provided</span>}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-400">
              <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Choices:</h4>
              <ul className="space-y-1">
                {(Array.isArray(kc.choices) ? kc.choices : []).map((choice, i) => (
                  <li key={i} className="text-xs sm:text-sm text-gray-700">
                    {choice}
                    {kc.answer && choice.startsWith(kc.answer + ":") && (
                      <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                    )}
                  </li>
                ))}
              </ul>
              {kc.explain && (
                <p className="mt-2 text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Explanation:</span> {kc.explain}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>

    <ConfirmationModal
      isOpen={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      onConfirm={performDelete}
      title="Delete Knowledge Check"
      message="Are you sure you want to delete this knowledge check? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
}
