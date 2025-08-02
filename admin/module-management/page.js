"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';     
import ErrorMessage from '../components/ErrorMessage';     
import StatusMessage from '../components/StatusMessage';     
import ModuleRow from '../components/ModuleRow';             
import AddModuleForm from '../components/AddModuleForm';     

export default function ModuleManagementPage() { 
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [heading, setHeading] = useState('');
  const [subHeading, setSubHeading] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  const router = useRouter();

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/modules');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load modules');
      }
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!heading.trim() || !subHeading.trim()) {
      setSubmitStatus('Both fields are required.');
      return;
    }

    try {
      setSubmitStatus(expandedModuleId === 'new' ? 'Saving...' : 'Updating...');
      const isNew = expandedModuleId === 'new';
      const method = isNew ? 'POST' : 'PUT';
      const body = isNew ? JSON.stringify({ heading, subHeading }) : JSON.stringify({ id: expandedModuleId, heading, subHeading });

      const response = await fetch('/api/admin/modules', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (isNew ? 'Submission failed.' : 'Update failed.'));
      }

      await fetchModules();
      setSubmitStatus(isNew ? '✅ Module added successfully!' : '✅ Module updated successfully!');
      setHeading('');
      setSubHeading('');
      setExpandedModuleId(null);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitStatus('❌ ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this module?');
    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/modules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete module');
      setModules(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const handleModuleClick = (id) => {
    router.push(`/admin/content`);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 relative pb-16 min-h-screen">
      <StatusMessage message={submitStatus} />

      {loading && <LoadingSpinner message="Loading modules..." />}

      {error && <ErrorMessage error={error} onRetry={() => window.location.reload()} />}

      {!loading && !error && (
        <div>
          <table className="w-full table-fixed">
            <tbody>
              {modules.length > 0 ? (
                modules.map((module) => (
                  <ModuleRow
                    key={module.id}
                    module={module}
                    isExpanded={expandedModuleId === module.id}
                    heading={heading}
                    subHeading={subHeading}
                    onHeadingChange={(e) => setHeading(e.target.value)}
                    onSubHeadingChange={(e) => setSubHeading(e.target.value)}
                    onEdit={(id) => setExpandedModuleId(id)}
                    onDelete={handleDelete}
                    onSubmit={handleSubmit}
                    onModuleClick={handleModuleClick}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="py-6 px-4 text-center text-gray-500">
                    No modules found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {expandedModuleId === 'new' && (
            <AddModuleForm
              heading={heading}
              subHeading={subHeading}
              onHeadingChange={(e) => setHeading(e.target.value)}
              onSubHeadingChange={(e) => setSubHeading(e.target.value)}
              onSubmit={handleSubmit}
              onClose={() => setExpandedModuleId(null)}
            />
          )}
        </div>
      )}

      <button
        onClick={() => setExpandedModuleId('new')}
        className="bg-blue-600 text-white rounded p-4 shadow-lg hover:bg-blue-700 transition-all duration-300"
        style={{
          width: '150px',
          height: '80px',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Add Module
      </button>
    </div>
  );
}