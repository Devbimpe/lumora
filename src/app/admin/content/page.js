'use client';
import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFaviconUrl, getDefaultFaviconUrl } from '../../lib/favicons';

import EditModule from '../components/EditModule';
import NewContentPageForm from '../components/NewContentPageForm';
import CreateKnowledgeCheckForm from '../components/CreateKnowledgeCheckForm';
import ContentPageItem from '../components/ContentPageItem';
import KnowledgeCheckItem from '../components/KnowledgeCheckItem';

function ContentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const mode = searchParams.get('mode');

  const [modules, setModules] = useState([]);
  const [content, setContent] = useState([]);
  const [knowledgeChecks, setKnowledgeChecks] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [heading, setHeading] = useState('');
  const [subHeading, setSubHeading] = useState('');
  const [faviconURL, setFaviconURL] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showKCForm, setShowKCForm] = useState(false);
  const [newContentError, setNewContentError] = useState(null);
  const [kcFormError, setKcFormError] = useState(null);
  const newContentFormRef = useRef(null);
  const kcFormRef = useRef(null);

  const currentModule = modules.find((module) => module.ModuleID.toString() === selectedModule);

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/modules');
      const data = await res.json();
      setModules(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch modules:', err);
      return [];
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (mode === 'new') {
      setSelectedModule('');
      setContent([]);
      setKnowledgeChecks([]);
      setFaviconURL(getDefaultFaviconUrl());
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    fetchModules().then((data) => {
      if (!isMounted || data.length === 0) {
        return;
      }

      const hasRequestedModule = moduleId
        ? data.some((module) => module.ModuleID.toString() === moduleId)
        : false;
      const targetId = hasRequestedModule ? moduleId : data[0].ModuleID.toString();
      setSelectedModule(targetId);

      const module = data.find((item) => item.ModuleID.toString() === targetId);
      if (module) {
        setHeading(module.Heading);
        setSubHeading(module.Subheading);
        setFaviconURL(module.faviconURL || '');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [moduleId, mode]);

  useEffect(() => {
    if (mode === 'new') {
      return;
    }

    if (currentModule) {
      setHeading(currentModule.Heading);
      setSubHeading(currentModule.Subheading);
      setFaviconURL(currentModule.faviconURL || '');
    }
  }, [mode, currentModule]);

  useEffect(() => {
    const handleToggleCreate = () => {
      setShowCreateForm((prev) => !prev);
    };

    window.addEventListener('toggle-create-form', handleToggleCreate);
    return () => window.removeEventListener('toggle-create-form', handleToggleCreate);
  }, []);

  useEffect(() => {
    const handleToggleKC = () => {
      setShowKCForm((prev) => !prev);
    };

    window.addEventListener('toggle-kc-form', handleToggleKC);
    return () => window.removeEventListener('toggle-kc-form', handleToggleKC);
  }, []);

  useEffect(() => {
    if (showCreateForm) {
      setTimeout(() => newContentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [showCreateForm]);

  useEffect(() => {
    if (showKCForm) {
      setTimeout(() => kcFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [showKCForm]);

  useEffect(() => {
    if (!selectedModule || mode === 'new') {
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch(`/api/content?moduleId=${selectedModule}`).then((response) => response.json()),
      fetch(`/api/knowledge-checks?moduleId=${selectedModule}`).then((response) => response.json()),
    ])
      .then(([contentData, checksData]) => {
        if (!isMounted) {
          return;
        }

        setContent(Array.isArray(contentData) ? contentData : []);
        setKnowledgeChecks(Array.isArray(checksData) ? checksData : []);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedModule, mode]);

  const handleEditModuleSubmit = async () => {
    if (!heading.trim() || !subHeading.trim()) {
      setSubmitStatus('Both fields are required.');
      return;
    }

    try {
      const isNew = mode === 'new';
      setSubmitStatus(isNew ? 'Saving...' : 'Updating...');
      const method = isNew ? 'POST' : 'PUT';
      const urlToSave = faviconURL?.trim() || (isNew ? getDefaultFaviconUrl() : getFaviconUrl('1'));
      const body = isNew
        ? JSON.stringify({ heading, subHeading, faviconURL: urlToSave })
        : JSON.stringify({ id: selectedModule, heading, subHeading, faviconURL: urlToSave });

      const response = await fetch('/api/admin/modules', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (isNew ? 'Submission failed.' : 'Update failed.'));
      }

      if (isNew) {
        const updatedModules = await fetchModules();
        if (updatedModules.length > 0) {
          const newModule = updatedModules[updatedModules.length - 1];
          router.push(`/admin/content?moduleId=${newModule.ModuleID}`);
        }
      } else {
        setModules((prev) =>
          prev.map((module) =>
            module.ModuleID.toString() === selectedModule
              ? {
                  ...module,
                  Heading: heading,
                  Subheading: subHeading,
                  faviconURL: urlToSave,
                }
              : module,
          ),
        );
      }

      setSubmitStatus(isNew ? 'Module added successfully!' : 'Module updated successfully!');
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitStatus(err.message);
      setTimeout(() => setSubmitStatus(''), 3000);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            {mode === 'new' ? 'Create New Module' : 'Module Content'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {mode === 'new'
              ? 'Set up heading and sub-heading for your new module'
              : 'Create, edit, and manage content pages'}
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/module-management')}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 font-medium text-sm sm:text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Done Editing
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start">
            <div className="shrink-0">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-xs sm:text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-3 shrink-0 text-red-400 hover:text-red-600">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {(mode === 'new' || currentModule) && (
        <>
          {submitStatus && (
            <div
              className={`rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-sm sm:text-base font-medium ${
                submitStatus.includes('successfully') || submitStatus.includes('Saving') || submitStatus.includes('Updating')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {submitStatus}
            </div>
          )}
          <EditModule
            heading={heading}
            subHeading={subHeading}
            onHeadingChange={(event) => setHeading(event.target.value)}
            onSubHeadingChange={(event) => setSubHeading(event.target.value)}
            onSubmit={handleEditModuleSubmit}
            onClose={() => router.push('/admin/module-management')}
            isNew={mode === 'new'}
            initialFaviconUrl={faviconURL}
            onFaviconChange={(url) => setFaviconURL(url)}
          />
        </>
      )}

      {(mode !== 'new' ? selectedModule : true) && (
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => (mode === 'new' ? null : setShowCreateForm((prev) => !prev))}
            disabled={mode === 'new'}
            className={`w-full sm:w-auto rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 transition-colors duration-200 font-medium flex items-center justify-start gap-2 shadow-lg text-sm sm:text-base ${
              mode === 'new'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : showCreateForm
                ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-xl'
                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl'
            }`}
          >
            <svg
              className={`w-6 h-6 transition-transform duration-200 ${showCreateForm ? 'rotate-45' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="w-full text-center">{showCreateForm ? 'Close New Content Form' : 'Add Content Page'}</p>
          </button>
          <button
            onClick={() => (mode === 'new' ? null : setShowKCForm((prev) => !prev))}
            disabled={mode === 'new'}
            className={`w-full sm:w-auto rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 transition-colors duration-200 font-medium flex items-center justify-start gap-2 shadow-lg text-sm sm:text-base ${
              mode === 'new'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : showKCForm
                ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-xl'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
            }`}
          >
            <svg
              className={`w-6 h-6 transition-transform duration-200 ${showKCForm ? 'rotate-45' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="w-full text-center">{showKCForm ? 'Close New KC Form' : 'Add Knowledge Check'}</p>
          </button>
          <p className="mt-2 sm:mt-0 sm:self-center text-xs sm:text-sm text-gray-500">
            {content.length} {content.length === 1 ? 'page' : 'pages'} · {knowledgeChecks.length}{' '}
            {knowledgeChecks.length === 1 ? 'knowledge check' : 'knowledge checks'}
            {mode === 'new' && ' - Save the module to add content'}
          </p>
        </div>
      )}

      {mode !== 'new' &&
        (loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
            <span className="text-gray-600 text-lg font-medium">Loading content...</span>
          </div>
        ) : (
          <>
            {content.length > 0 ? (
              <div className="space-y-4">
                {content.map((item, index) => (
                  <ContentPageItem
                    key={item.ContentID}
                    item={item}
                    index={index}
                    selectedModule={selectedModule}
                    onContentChange={setContent}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content pages yet</h3>
                <p className="text-gray-500">Add a content page using the button above to get started.</p>
              </div>
            )}

            {showCreateForm && (
              <div ref={newContentFormRef} className="mt-6 sm:mt-8">
                {newContentError && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 sm:p-4 mb-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs sm:text-sm text-red-700">{newContentError}</p>
                      <button onClick={() => setNewContentError(null)} className="shrink-0 text-red-400 hover:text-red-600">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                <NewContentPageForm
                  selectedModule={selectedModule}
                  onClose={() => { setShowCreateForm(false); setNewContentError(null); }}
                  onCreated={(data) => {
                    setContent(data);
                    window.dispatchEvent(new Event('content-updated'));
                  }}
                  onError={setNewContentError}
                />
              </div>
            )}

            {knowledgeChecks.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Knowledge Checks</h2>
                <div className="space-y-4">
                  {knowledgeChecks.map((kc, index) => (
                    <KnowledgeCheckItem
                      key={kc.knowledgeCheckId}
                      kc={kc}
                      index={index}
                      selectedModule={selectedModule}
                      onKCChange={(data) => {
                        setKnowledgeChecks(data);
                        window.dispatchEvent(new Event('kc-updated'));
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {showKCForm && (
              <div ref={kcFormRef} className="mt-6 sm:mt-8">
                {kcFormError && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 sm:p-4 mb-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs sm:text-sm text-red-700">{kcFormError}</p>
                      <button onClick={() => setKcFormError(null)} className="shrink-0 text-red-400 hover:text-red-600">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                <CreateKnowledgeCheckForm
                  selectedModule={selectedModule}
                  onClose={() => { setShowKCForm(false); setKcFormError(null); }}
                  onCreated={(data) => {
                    setKnowledgeChecks(data);
                    window.dispatchEvent(new Event('kc-updated'));
                  }}
                  onError={setKcFormError}
                />
              </div>
            )}
          </>
        ))}
    </div>
  );
}

export default function ContentPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
        <span className="text-gray-600 text-lg font-medium">Loading content...</span>
      </div>
    }>
      <ContentPageContent />
    </Suspense>
  );
}