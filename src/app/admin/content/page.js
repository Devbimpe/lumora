'use client';
import { useState, useEffect } from 'react';

export default function ContentPage() {
  const [content, setContent] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editOverview, setEditOverview] = useState('');
  const [editReading, setEditReading] = useState('');

  // Fetch modules
  useEffect(() => {
    // setLoading(true);
    fetch('/api/modules')
      .then(res => res.json())
      .then(data => {
        setModules(data);
        if (data.length > 0) setSelectedModule(data[0].ModuleID.toString());
      })
      .catch(() => setModules([]));
  }, []);

  // Fetch content for selected module
  useEffect(() => {
    if (!selectedModule) return;
    setLoading(true);
    fetch(`/api/content?moduleId=${selectedModule}`)
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedModule]);

  // Start editing
  const startEdit = (item) => {
    setEditingId(item.ContentID);
    setEditOverview(item.Overview);
    setEditReading(item.Reading);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditOverview('');
    setEditReading('');
  };

  // Save edit
  const saveEdit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/content/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Overview: editOverview,
          Reading: editReading,
        }),
      });
      if (!res.ok) throw new Error('Failed to update content');
      // Refresh content
      fetch(`/api/content?moduleId=${selectedModule}`)
        .then(res => res.json())
        .then(data => setContent(data));
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Module Content Viewer</h1>
          <p className="text-gray-600">Browse and review educational content by selecting a module.</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded relative mb-6">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Dynamic Module Selector */}
        <div className="mb-8">
          <label htmlFor="module" className="block text-sm font-medium text-gray-700 mb-2">
            Select a Module
          </label>
          <select
            id="module"
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="block w-full max-w-lg px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {modules.map((mod) => (
              <option key={mod.ModuleID} value={mod.ModuleID}>
                {mod.Heading} — {mod.Subheading}
              </option>
            ))}
          </select>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-600 font-medium">Loading content...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto" style={{ minWidth: '900px' }}>
            <div className="bg-blue-100 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-blue-900">
                Content for Module {selectedModule}
              </h2>
            </div>
            {content.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {content.map((item) => (
                  <div key={item.ContentID} className="px-6 py-5 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">Item #{item.ContentID}</h3>
                      <span className="text-sm text-gray-500">Module {item.ModuleID}</span>
                    </div>
                    {editingId === item.ContentID ? (
                      <div>
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-600">Overview:</h4>
                          <textarea
                            className="w-full border rounded px-2 py-1"
                            value={editOverview}
                            onChange={e => setEditOverview(e.target.value)}
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-600">Reading:</h4>
                          <textarea
                            className="w-full border rounded px-2 py-1"
                            value={editReading}
                            onChange={e => setEditReading(e.target.value)}
                          />
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                            onClick={saveEdit}
                          >
                            Save
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-600">Overview:</h4>
                          <p className="text-gray-700 mt-1">{item.Overview}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-600">Reading:</h4>
                          <p className="text-gray-700 mt-1">{item.Reading}</p>
                        </div>
                        <button
                          className="mt-2 px-3 py-1 bg-yellow-400 text-gray-900 rounded"
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center px-6 py-10 text-gray-500">
                <p>No content available for Module {selectedModule}.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}