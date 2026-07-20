"use client";
import { useState } from 'react';
import { api, apiErrorMessage } from '@/app/_lib/api-client';
import ConfirmationModal from './ConfirmationModal';
import KCReadView from './kc/KCReadView';
import KCEditForm from './kc/KCEditForm';

export default function KnowledgeCheckItem({ kc, index, selectedModule, content = [], onKCChange }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const performDelete = async () => {
    try {
      await api.delete('/api/knowledge-checks', { json: { knowledgeCheckId: kc.knowledgeCheckId, moduleID: selectedModule } });
      const checksData = await api.get(`/api/knowledge-checks?moduleId=${selectedModule}`).json();
      onKCChange(Array.isArray(checksData) ? checksData : []);
    } catch (err) {
      setError(await apiErrorMessage(err, 'Failed to delete knowledge check'));
    }
  };

  return (
    <>
      <div id={`knowledge-check-${kc.knowledgeCheckId}`} className="bg-white rounded-xl shadow-lg overflow-hidden">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 flex items-start justify-between gap-3">
            <p className="text-xs sm:text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="shrink-0 text-red-400 hover:text-red-600">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {editing ? (
          <KCEditForm
            kc={kc}
            index={index}
            selectedModule={selectedModule}
            content={content}
            onCancel={() => setEditing(false)}
            onSaved={(data) => {
              onKCChange(data);
              setEditing(false);
            }}
          />
        ) : (
          <>
            <KCReadView kc={kc} index={index} />
            <div className="flex flex-col sm:flex-row gap-2 px-4 sm:px-6 pb-4 sm:pb-6">
              <button onClick={() => setEditing(true)} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">Edit</button>
              <button onClick={() => setDeleteModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium">Delete</button>
            </div>
          </>
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