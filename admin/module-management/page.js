'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ModuleManagement() {
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
      
      // Determine if we're creating or updating
      const isNew = expandedModuleId === 'new';
      const method = isNew ? 'POST' : 'PUT';
      const body = isNew 
        ? JSON.stringify({ heading, subHeading })
        : JSON.stringify({ id: expandedModuleId, heading, subHeading });

      const response = await fetch('/api/admin/modules', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (isNew ? 'Submission failed.' : 'Update failed.'));
      }

      // Refresh modules after successful operation
      await fetchModules();
      
      setSubmitStatus(isNew 
        ? '✅ Module added successfully!' 
        : '✅ Module updated successfully!');
      
      // Clear form and close
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
      {submitStatus && (
        <div className={`mb-4 p-3 rounded-md text-center ${
          submitStatus.includes('✅') ? 'bg-green-100 text-green-800' : 
          submitStatus.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {submitStatus}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading modules...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="text-red-500 font-bold mr-2">Error:</div>
            <div>{error}</div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div>
          <table className="w-full table-fixed">
            <tbody>
              {modules.length > 0 ? (
                modules.map((module) => (
                  <React.Fragment key={module.id}>
                    {expandedModuleId === module.id && (
                      <tr>
                        <td colSpan="2" className="p-4">
                          <div className="bg-[#fed5ab] shadow p-4">
                            <div className="flex justify-between items-center mb-2">
                            </div>
                            <table className="w-full">
                              <tbody>
                                <tr>
                                  <td className="bg-gray-200 px-2 py-3">
                                    <input
                                      type="text"
                                      placeholder="HEADING"
                                      value={heading}
                                      onChange={(e) => setHeading(e.target.value)}
                                      className="w-full px-2 py-1 placeholder:text-center"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="h-2"></td>
                                </tr>
                                <tr>
                                  <td className="bg-gray-200 px-2 py-1">
                                    <input
                                      type="text"
                                      placeholder="SUB-HEADING"
                                      value={subHeading}
                                      onChange={(e) => setSubHeading(e.target.value)}
                                      className="w-full px-2 placeholder:text-center"
                                    />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="flex justify-end">
                              <button
                                onClick={handleSubmit}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                              >
                                Update Module
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    <tr className="bg-[#dbf2e0] hover:scale-105 transition-transform duration-200 relative group cursor-pointer"
                        onClick={() => handleModuleClick(module.id)}>
                      <td className="py-6 px-4 text-2xl">MODULE {module.id}:</td>
                      <td className="py-6 px-4 text-2xl relative">
                        {module.Heading}
                        
                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedModuleId(module.id);
                            }}
                            className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(module.id);
                            }}
                            className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td colSpan="2" className="h-4"></td>
                    </tr>
                  </React.Fragment>
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
            <div className="bg-[#fed5ab] shadow p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Add New Module</h3>
                <button 
                  onClick={() => setExpandedModuleId(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="HEADING"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md placeholder:text-center bg-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="SUB-HEADING"
                    value={subHeading}
                    onChange={(e) => setSubHeading(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md placeholder:text-center bg-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save Module
                  </button>
                </div>
              </div>
            </div>
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
          justifyContent: 'center'
        }}
      >
        Add Module
      </button>
    </div>
  );
}