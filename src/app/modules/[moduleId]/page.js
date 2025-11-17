'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import '../Module.css';

export default function ModulePage() {
  const { moduleId } = useParams();
  const [rawContent, setRawContent] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleHeading, setModuleHeading] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Format text as list if it contains bullet points
  function formatAsList(text) {
    if (!text) return null;
    const parts = text.split('●').map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) return <p className="mb-4 text-gray-700 leading-relaxed">{text}</p>;
    return (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
        {parts.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  }

  useEffect(() => {
    async function fetchContent() {
      try {
        // Fetch content for the current moduleId
        const res = await fetch(`/api/Module?moduleId=${moduleId.replace('module', '')}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setRawContent(data);
        
        if (data && data.length > 0) {
          setModuleHeading(data[0]?.Heading || 'Module');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [moduleId]);

  useEffect(() => {
    if (!rawContent.length) return;

    const out = [];
    const processedContentIds = new Set();

    // Process reading content (excluding misconceptions and corrections)
    rawContent.forEach((item) => {
      if (item.Reading && !item.Question && 
          (!item.Overview || !['common misconceptions', 'correction'].includes((item.Overview || '').trim().toLowerCase()))) {
        // Only add if we haven't processed this contentId yet
        if (!processedContentIds.has(item.ContentID)) {
          out.push({
            type: 'reading',
            contentId: item.ContentID,
            overview: item.Overview || '',
            text: item.Reading,
          });
          processedContentIds.add(item.ContentID);
        }
      }
    });

    // Process misconceptions and corrections
    const misRows = rawContent.filter(
      (r) => (r.Overview || '').trim().toLowerCase() === 'common misconceptions'
    );
    const corRows = rawContent.filter(
      (r) => (r.Overview || '').trim().toLowerCase() === 'correction'
    );
    if (misRows.length && corRows.length) {
      const misPairs = misRows.map((m, i) => ({
        misconception: m.Reading?.trim() ?? '',
        correction: corRows[i]?.Reading?.trim() ?? '',
      }));
      out.push({
        type: 'misTable',
        overview: 'Common Misconceptions',
        pairs: misPairs,
      });
    }

    // Process quiz/knowledge checks
    rawContent.forEach((item) => {
      if (item.Question && item.Question.trim().length > 0) {
        out.push({
          type: 'quiz',
          contentId: item.ContentID,
          overview: item.Overview || 'Knowledge Check',
          question: item.Question,
          options: item.Reading
            ? item.Reading.split(/(?=[A-D]\.\s)/g).map((s) => s.trim()).filter(Boolean)
            : [],
          answer: item.Answer?.trim() ?? '',
        });
      }
    });

    setContentItems(out);
  }, [rawContent]);

  const handleOptionClick = (contentId, letter, correctAnswer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [contentId]: letter
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading module content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Error: {error}</p>
          <Link href="/training-module" className="text-green-700 hover:underline">
            Back to Modules
          </Link>
        </div>
      </div>
    );
  }

  if (!contentItems.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No content available for this module</p>
          <Link href="/training-module" className="text-green-700 hover:underline">
            Back to Modules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/training-module" className="inline-flex items-center text-green-700 hover:text-green-800 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Modules
        </Link>

        {/* Module Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-4">
            {moduleHeading}
          </h1>
        </div>

        {/* Content Items */}
        <div className="space-y-8">
          {contentItems.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
              {item.type === 'reading' && (
                <>
                  {item.overview && (
                    <h2 className="text-2xl font-bold text-green-700 mb-4">{item.overview}</h2>
                  )}
                  {formatAsList(item.text)}
                </>
              )}

              {item.type === 'misTable' && (
                <>
                  <h2 className="text-2xl font-bold text-green-700 mb-4">{item.overview}</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-green-100">
                          <th className="border border-gray-300 px-4 py-3 text-left font-bold text-green-700">Misconception</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-bold text-green-700">Correction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.pairs.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.misconception}</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.correction}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {item.type === 'quiz' && (
                <>
                  <h2 className="text-2xl font-bold text-green-700 mb-4">{item.overview}</h2>
                  <p className="text-lg font-semibold text-gray-800 mb-6">{item.question}</p>
                  <ul className="space-y-3">
                    {item.options.map((opt, idx) => {
                      const letter = opt.charAt(0);
                      const isSelected = selectedAnswers[item.contentId] === letter;
                      const isCorrect = item.answer === letter;
                      const showFeedback = selectedAnswers[item.contentId] !== undefined;

                      return (
                        <li
                          key={idx}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            !showFeedback
                              ? 'border-gray-300 hover:border-green-400 bg-white hover:bg-green-50'
                              : isCorrect
                              ? 'border-green-500 bg-green-50'
                              : isSelected
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 bg-white opacity-60'
                          }`}
                          onClick={() => handleOptionClick(item.contentId, letter, item.answer)}
                        >
                          <div className="flex items-start">
                            {showFeedback && isCorrect && (
                              <span className="text-green-600 mr-3 text-xl">✓</span>
                            )}
                            {showFeedback && isSelected && !isCorrect && (
                              <span className="text-red-600 mr-3 text-xl">✗</span>
                            )}
                            <span className="text-gray-800">{opt}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}