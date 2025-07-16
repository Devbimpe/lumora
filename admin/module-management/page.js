'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ModuleManagement() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heading, setHeading] = useState('');
  const [subHeading, setSubHeading] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!heading.trim() || !subHeading.trim()) {
      setSubmitStatus('Both fields are required.');
      return;
    }

    try {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heading, subHeading }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed.');
      }

      setSubmitStatus('✅ Module added successfully!');
      setHeading('');
      setSubHeading('');
      const fetchData = async () => {
        const response = await fetch('/api/admin/modules');
        const data = await response.json();
        setModules(data);
      };
      fetchData();
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

      {submitStatus && (
        <div className={`p-4 mb-4 ${submitStatus.includes('successfully') ? 'bg-green-100' : 'bg-red-100'}`}>
          {submitStatus}
        </div>
      )}

      {!loading && !error && (
        <div>
          <div className="mb-6 bg-[#fed5ab] p-4 rounded shadow">
            <input
              type="text"
              placeholder="HEADING"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-2 py-1 mb-2 placeholder:text-center border rounded"
            />
            <input
              type="text"
              placeholder="SUB-HEADING"
              value={subHeading}
              onChange={(e) => setSubHeading(e.target.value)}
              className="w-full px-2 py-1 placeholder:text-center border rounded"
            />
            <button
              onClick={handleSubmit}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Module
            </button>
          </div>

          <table className="w-full table-fixed">
            <tbody>
              {modules.length > 0 ? (
                modules.map((module) => (
                  <tr
                    key={module.id}
                    className="bg-[#dbf2e0] hover:scale-105 transition-transform duration-200 relative group cursor-pointer"
                    onClick={() => handleModuleClick(module.id)}
                  >
                    <td className="py-6 px-4 text-2xl">MODULE {module.id}:</td>
                    <td className="py-6 px-4 text-2xl relative">
                      {module.Heading}
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
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