"use client";
import { useState } from 'react';

export default function CreateKnowledgeCheckForm({ selectedModule, onClose, onCreated, onError }) {
  const [kcQuestion, setKcQuestion] = useState("");
  const [kcChoices, setKcChoices] = useState(["", ""]);
  const [kcAnswer, setKcAnswer] = useState("");
  const [kcExplain, setKcExplain] = useState("");
  const [kcTab, setKcTab] = useState("multiple-choice");
  const [kcDescAnswer, setKcDescAnswer] = useState("");
  const [showKCPreview, setShowKCPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetKCForm = () => {
    setKcQuestion("");
    setKcChoices(["", ""]);
    setKcAnswer("");
    setKcExplain("");
    setKcTab("multiple-choice");
    setKcDescAnswer("");
    setShowKCPreview(false);
  };

  const createNewKnowledgeCheck = async () => {
    onError(null);
    if (!kcQuestion.trim()) {
      onError("Question is required");
      return;
    }

    // descriptive questions don't need choices or a correct answer
    const isDescriptive = kcTab === "descriptive";

    // only validate choices/answer for multiple-choice questions
    if (!isDescriptive) {
      const filledChoices = kcChoices.filter((c) => c.trim());
      if (filledChoices.length < 2) {
        onError("At least 2 choices are required");
        return;
      }
      if (!kcAnswer) {
        onError("Please select the correct answer");
        return;
      }
    }

    // for descriptive, send empty choices; for MC, format as "A: ...", "B: ..." etc.
    const filledChoices = kcChoices.filter((c) => c.trim());
    const formattedChoices = isDescriptive
      ? []
      : filledChoices.map((text, i) => `${String.fromCharCode(65 + i)}: ${text}`);

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/knowledge-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // for descriptive: no answer, sample answer goes in explain field
        body: JSON.stringify({
          moduleID: selectedModule,
          contentId: null,
          question: kcQuestion,
          choices: formattedChoices,
          answer: isDescriptive ? "" : kcAnswer,
          explain: isDescriptive ? kcDescAnswer : kcExplain,
        }),
      });

      if (!res.ok) throw new Error("Failed to create knowledge check");

      const checksRes = await fetch(`/api/knowledge-checks?moduleId=${selectedModule}`);
      const checksData = await checksRes.json();
      onCreated(Array.isArray(checksData) ? checksData : []);
      resetKCForm();
      onClose();
    } catch (err) {
      onError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          New Knowledge Check for Module {selectedModule}
        </h3>
        <button
          onClick={() => { resetKCForm(); onClose(); }}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 mb-5">
        <button
          onClick={() => setKcTab("multiple-choice")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
            kcTab === "multiple-choice"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Multiple Choice
        </button>
        <button
          onClick={() => setKcTab("descriptive")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
            kcTab === "descriptive"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Descriptive
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question
          </label>
          <textarea
            placeholder="Enter the question"
            value={kcQuestion}
            onChange={(e) => setKcQuestion(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="3"
          />
        </div>

        {kcTab === "multiple-choice" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choices
              </label>
              {kcChoices.map((choice, idx) => {
                const letter = String.fromCharCode(65 + idx);
                return (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-700 w-6">{letter}:</span>
                    <input
                      type="text"
                      placeholder={`Choice ${letter}`}
                      value={choice}
                      onChange={(e) => {
                        const updated = [...kcChoices];
                        updated[idx] = e.target.value;
                        setKcChoices(updated);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {kcChoices.length > 2 && (
                      <button
                        onClick={() => {
                          setKcChoices(kcChoices.filter((_, i) => i !== idx));
                          setKcAnswer("");
                        }}
                        className="text-red-500 hover:text-red-700 font-bold text-lg px-2"
                      >
                        X
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={() => setKcChoices([...kcChoices, ""])}
                className="mt-1 text-sm text-green-600 hover:text-green-800 font-medium"
              >
                + Add Choice
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer
              </label>
              <select
                value={kcAnswer}
                onChange={(e) => setKcAnswer(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="">Select correct answer</option>
                {kcChoices.reduce((opts, choice, idx) => {
                  if (choice.trim()) {
                    const letter = String.fromCharCode(65 + opts.length);
                    opts.push(
                      <option key={letter} value={letter}>
                        {letter}
                      </option>,
                    );
                  }
                  return opts;
                }, [])}
              </select>
            </div>
          </>
        )}

        {kcTab === "descriptive" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sample Answer
            </label>
            <textarea
              placeholder="Enter a sample or expected answer for grading reference"
              value={kcDescAnswer}
              onChange={(e) => setKcDescAnswer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="5"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (optional)
          </label>
          <textarea
            placeholder={
              kcTab === "descriptive"
                ? "Add any additional notes or context"
                : "Explain why the correct answer is right"
            }
            value={kcExplain}
            onChange={(e) => setKcExplain(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="3"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowKCPreview((prev) => !prev)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            {showKCPreview ? "Hide Preview" : "Preview"}
          </button>
          <button
            onClick={createNewKnowledgeCheck}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Knowledge Check"}
          </button>
          <button
            onClick={() => { resetKCForm(); onClose(); }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>

        {/* Live preview of the knowledge check before saving */}
        {showKCPreview && (
          <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Preview</h4>
            <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 break-words">
              {kcQuestion || "No question entered"}
            </h5>

            {kcTab === "multiple-choice" ? (
              <div className="space-y-2 mb-3">
                {kcChoices.filter((c) => c.trim()).length > 0 ? (
                  kcChoices
                    .map((choice, i) => ({ label: String.fromCharCode(65 + i), text: choice }))
                    .filter((c) => c.text.trim())
                    .map((choice) => (
                      <div
                        key={choice.label}
                        className={`p-2 rounded-lg border text-sm ${
                          kcAnswer === choice.label
                            ? "border-green-500 bg-green-50 text-green-800"
                            : "border-gray-200 bg-gray-50 text-gray-700"
                        }`}
                      >
                        <span className="font-medium mr-2">{choice.label}:</span>
                        {choice.text}
                        {kcAnswer === choice.label && (
                          <span className="ml-2 text-green-600 text-xs font-semibold">✓ Correct</span>
                        )}
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
                  {kcDescAnswer || <span className="italic text-gray-400">No sample answer entered</span>}
                </div>
              </div>
            )}

            {kcExplain && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-1">Explanation:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{kcExplain}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
