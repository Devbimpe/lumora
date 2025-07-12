'use client';
import { useState, useEffect } from 'react';

export default function ModuleManagement() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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
    
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Module Management</h1>
      
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Title</th>
              </tr>
            </thead>
            <tbody>
              {modules.length > 0 ? (
                modules.map(module => (
                  <tr key={module.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{module.id}</td>
                    <td className="py-3 px-4 font-medium">{module.title}</td>
                  </tr>
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
        </div>
      )}
    </div>
  );
}