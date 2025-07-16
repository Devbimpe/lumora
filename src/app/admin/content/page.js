'use client';
import { useState, useEffect } from 'react';

export default function ContentPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState('1');

  // Fetch content for selected module
  const fetchContent = async (moduleId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content?moduleId=${moduleId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load content');
      }
      
      const data = await response.json();
      setContent(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(selectedModule);
  }, [selectedModule]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Content Display</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="text-red-500 font-bold mr-2">Error:</div>
            <div>{error}</div>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Module Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Module:</label>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="1">Module 1</option>
          <option value="2">Module 2</option>
          <option value="3">Module 3</option>
        </select>
      </div>

      {/* Display Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="bg-gray-100 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Content for Module {selectedModule}</h2>
        </div>
        
        {content.length > 0 ? (
          <div className="p-6">
            {content.map((item) => (
              <div key={item.id} className="mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">Content Item #{item.id}</h3>
                  <span className="text-sm text-gray-500">Module {item.ModuleID}</span>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-medium text-gray-700 mb-1">Overview:</h4>
                  <p className="text-gray-600">{item.Overview}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Reading:</h4>
                  <p className="text-gray-600">{item.Reading}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No content available for Module {selectedModule}</p>
          </div>
        )}
      </div>
    </div>
  );
}