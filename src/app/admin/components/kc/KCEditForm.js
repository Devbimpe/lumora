'use client';
import { useState } from 'react';
import { api, apiErrorMessage } from '@/app/_lib/api-client';
import KCTabSwitcher from './KCTabSwitcher';
import ChoicesEditor from './ChoicesEditor';
import CorrectAnswerSelect from './CorrectAnswerSelect';
import KCPreview from './KCPreview';
import { QuestionInput, SampleAnswerInput, ExplanationInput } from './KCFields';
import { validateKC, buildKCPayload } from './validateKC';

export default function KCEditForm({ kc, index, selectedModule, onCancel, onSaved }) {
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(kc.question || '');
  const [choices, setChoices] = useState(
    Array.isArray(kc.choices) && kc.choices.length >= 2 ? kc.choices : ['', '']
  );
  // correctAnswer is carried as a string (select option value); '' means none selected.
  const [correctAnswer, setCorrectAnswer] = useState(
    typeof kc.correctAnswer === 'number' ? String(kc.correctAnswer) : ''
  );
  const [explanation, setExplanation] = useState(kc.explanation || '');
  const [tab, setTab] = useState(kc.type === 'open-ended' ? 'open-ended' : 'multiple-choice');
  const [sampleAnswer, setSampleAnswer] = useState(kc.type === 'open-ended' ? kc.sampleAnswer || '' : '');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formState = () => ({
    type: tab,
    question,
    explanation,
    choices,
    correctAnswer,
    sampleAnswer,
  });

  const save = async () => {
    const validationError = validateKC(formState());
    setError(validationError);
    if (validationError) return;

    try {
      setIsSubmitting(true);
      await api.put('/api/knowledge-checks', {
        json: {
          ...buildKCPayload(formState()),
          knowledgeCheckId: kc.knowledgeCheckId,
          moduleID: selectedModule,
        },
      });
      const checksData = await api.get(`/api/knowledge-checks?moduleId=${selectedModule}`).json();
      onSaved(Array.isArray(checksData) ? checksData : []);
    } catch (err) {
      setError(await apiErrorMessage(err, 'Failed to update knowledge check'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeChoice = (idx) => {
    setChoices(choices.filter((_, i) => i !== idx));
    setCorrectAnswer('');
  };

  return (
    <div className="p-4 sm:p-6 bg-blue-50 border-l-4 border-blue-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Editing Check {index + 1}</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 mb-4 flex items-start justify-between gap-3">
          <p className="text-xs sm:text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="shrink-0 text-red-400 hover:text-red-600">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <KCTabSwitcher tab={tab} onChange={setTab} />

      <div className="space-y-4">
        <QuestionInput value={question} onChange={setQuestion} />

        {tab === 'multiple-choice' && (
          <>
            <ChoicesEditor choices={choices} onChange={setChoices} onRemove={removeChoice} />
            <CorrectAnswerSelect choices={choices} value={correctAnswer} onChange={setCorrectAnswer} />
          </>
        )}

        {tab === 'open-ended' && (
          <SampleAnswerInput value={sampleAnswer} onChange={setSampleAnswer} />
        )}

        <ExplanationInput type={tab} value={explanation} onChange={setExplanation} />

        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => setShowPreview((prev) => !prev)} className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base">
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button onClick={save} disabled={isSubmitting} className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
          <button onClick={onCancel} className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base">
            Cancel
          </button>
        </div>

        {showPreview && (
          <KCPreview
            question={question}
            type={tab}
            choices={choices}
            correctAnswer={correctAnswer}
            sampleAnswer={sampleAnswer}
            explanation={explanation}
          />
        )}
      </div>
    </div>
  );
}