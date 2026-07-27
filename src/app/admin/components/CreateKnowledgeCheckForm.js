"use client";
import { useState } from 'react';
import Select from 'react-select';
import { api, apiErrorMessage } from '@/app/_lib/api-client';
import KCTabSwitcher from './kc/KCTabSwitcher';
import ChoicesEditor from './kc/ChoicesEditor';
import CorrectAnswerSelect from './kc/CorrectAnswerSelect';
import KCPreview from './kc/KCPreview';
import { QuestionInput, RubricInput, GradingContextInput, ExplanationInput, OpenEndedExplanationInput } from './kc/KCFields';
import AIGradingToggle from './kc/AIGradingToggle';
import { validateKC, buildKCPayload } from './kc/validateKC';

export default function CreateKnowledgeCheckForm({ selectedModule, content = [], sections = [], onClose, onCreated, onError }) {
  const [question, setQuestion] = useState('');
  const [contentId, setContentId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [choices, setChoices] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [tab, setTab] = useState('multiple-choice');
  const [rubric, setRubric] = useState('');
  const [gradingContext, setGradingContext] = useState('');
  const [aiGradingEnabled, setAIGradingEnabled] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setQuestion('');
    setContentId('');
    setSectionId('');
    setChoices(['', '']);
    setCorrectAnswer('');
    setExplanation('');
    setTab('multiple-choice');
    setRubric('');
    setGradingContext('');
    setAIGradingEnabled(true);
    setShowPreview(false);
  };

  const formState = () => ({
    type: tab,
    question,
    explanation,
    choices,
    correctAnswer,
    rubric,
    gradingContext,
    aiGradingEnabled,
  });

  const createNewKnowledgeCheck = async () => {
    const error = validateKC(formState());
    onError(error);
    if (error) return;

    try {
      setIsSubmitting(true);
      await api.post('/api/knowledge-checks', {
        json: {
          ...buildKCPayload(formState()),
          moduleID: selectedModule,
          contentId: sections.length > 0 ? null : (contentId || null),
          sectionId: sections.length > 0 ? (sectionId || null) : null,
        },
      });
      const checksData = await api.get(`/api/knowledge-checks?moduleId=${selectedModule}`).json();
      onCreated(Array.isArray(checksData) ? checksData : []);
      resetForm();
      onClose();
    } catch (err) {
      onError(await apiErrorMessage(err, 'Failed to create knowledge check'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeChoice = (idx) => {
    setChoices(choices.filter((_, i) => i !== idx));
    setCorrectAnswer('');
  };
  const contentOptions = [
    { value: '', label: 'End of module' },
    ...content.map((item) => {
      const id = item.contentId ?? item.ContentID;
      const title = item.overview ?? item.Overview ?? `Content Page ${id}`;

      return {
        value: String(id),
        label: title,
      };
    }),
  ];

  const selectedContentOption = contentOptions.find((option) => option.value === String(contentId)) || contentOptions[0];
  const sectionOptions = [
    { value: '', label: 'End of module' },
    ...sections.map((section) => ({
      value: String(section.sectionId),
      label: section.title,
    })),
  ];

  const selectedSectionOption = sectionOptions.find((option) => option.value === String(sectionId)) || sectionOptions[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          New Knowledge Check for Module {selectedModule}
        </h3>
        <button
          onClick={() => { resetForm(); onClose(); }}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <KCTabSwitcher tab={tab} onChange={setTab} />

      <div className="space-y-4">
        {tab === 'open-ended' && (
          <AIGradingToggle enabled={aiGradingEnabled} onChange={setAIGradingEnabled} />
        )}

        {tab === 'open-ended' && aiGradingEnabled && (
          <GradingContextInput value={gradingContext} onChange={setGradingContext} />
        )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {sections.length > 0 ? 'Place this question in a section' : 'Place this question after this page'}
        </label>

        {sections.length > 0 ? (
          <>
            <Select
              value={selectedSectionOption}
              onChange={(option) => setSectionId(option?.value || '')}
              options={sectionOptions}
              isSearchable
              placeholder="Search sections..."
              className="text-sm"
              classNamePrefix="react-select"
            />

            <p className="mt-1 text-xs text-gray-500">
              Select a section so this question appears after all content pages in that section.
            </p>
          </>
        ) : (
          <>
            <Select
              value={selectedContentOption}
              onChange={(option) => setContentId(option?.value || '')}
              options={contentOptions}
              isSearchable
              placeholder="Search content pages..."
              className="text-sm"
              classNamePrefix="react-select"
            />

            <p className="mt-1 text-xs text-gray-500">
              Select a content page so this question appears immediately after that page in the learner module.
            </p>
          </>
        )}
      </div>
        
        <QuestionInput value={question} onChange={setQuestion} />

        {tab === 'multiple-choice' && (
          <>
            <ChoicesEditor choices={choices} onChange={setChoices} onRemove={removeChoice} />
            <CorrectAnswerSelect choices={choices} value={correctAnswer} onChange={setCorrectAnswer} />
          </>
        )}

        {tab === 'open-ended' && aiGradingEnabled && (
          <RubricInput value={rubric} onChange={setRubric} />
        )}

        {tab === 'open-ended' && !aiGradingEnabled && (
          <OpenEndedExplanationInput value={explanation} onChange={setExplanation} />
        )}

        {tab === 'multiple-choice' && (
          <ExplanationInput value={explanation} onChange={setExplanation} />
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowPreview((prev) => !prev)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={createNewKnowledgeCheck}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Knowledge Check'}
          </button>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>

        {showPreview && (
          <KCPreview
            question={question}
            type={tab}
            choices={choices}
            correctAnswer={correctAnswer}
            rubric={rubric}
            gradingContext={gradingContext}
            explanation={explanation}
            aiGradingEnabled={aiGradingEnabled}
          />
        )}
      </div>
    </div>
  );
}