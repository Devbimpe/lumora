"use client";
import { useState } from 'react';
import { api, apiErrorMessage } from '@/app/_lib/api-client';
import KCTabSwitcher from './kc/KCTabSwitcher';
import ChoicesEditor from './kc/ChoicesEditor';
import CorrectAnswerSelect from './kc/CorrectAnswerSelect';
import KCPreview from './kc/KCPreview';
import { QuestionInput, RubricInput, GradingContextInput, ExplanationInput, OpenEndedExplanationInput } from './kc/KCFields';
import AIGradingToggle from './kc/AIGradingToggle';
import { validateKC, buildKCPayload } from './kc/validateKC';

export default function CreateKnowledgeCheckForm({ selectedModule, onClose, onCreated, onError }) {
  const [question, setQuestion] = useState('');
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
          contentId: null,
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