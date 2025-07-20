'use client';
import { useEffect, useState } from 'react';
import '../Module.css';

export default function Module1() {
  const [rawContent, setRawContent] = useState([]);
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Format text as list if it contains bullet points
  function formatAsList(text) {
    if (!text) return null;
    const parts = text.split('●').map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) return <p className="reading-text">{text}</p>;
    return (
      <ul className="reading-list">
        {parts.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  }

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch('/api/users/Module?moduleId=1');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setRawContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  useEffect(() => {
    if (!rawContent.length) return;

    const moduleHeading = rawContent[0]?.Heading ?? 'Module';

    const byOverview = (ov) =>
      rawContent.filter((r) => (r.Overview || '').trim().toLowerCase() === ov.toLowerCase());

    const overviewSlide = byOverview('overview')[0];
    const whatIsSlide = byOverview('What is Sustainability in Software Engineering?')[0];
    const whySlide = byOverview('Why Sustainability Matters in Software')[0];
    const knowledgeSlide = rawContent.find((r) => r.Question && r.Question.trim().length > 0);

    const misRows = rawContent.filter(
      (r) => (r.Overview || '').trim().toLowerCase() === 'common misconceptions'
    );
    const corRows = rawContent.filter(
      (r) => (r.Overview || '').trim().toLowerCase() === 'correction'
    );

    const misPairs = misRows.map((m, i) => ({
      misconception: m.Reading?.trim() ?? '',
      correction: corRows[i]?.Reading?.trim() ?? '',
    }));

    const out = [];

    if (overviewSlide) {
      out.push({
        type: 'reading',
        heading: moduleHeading,
        overview: overviewSlide.Overview,
        text: overviewSlide.Reading,
      });
    }

    if (whatIsSlide) {
      out.push({
        type: 'reading',
        heading: moduleHeading,
        overview: whatIsSlide.Overview,
        text: whatIsSlide.Reading,
      });
    }

    if (whySlide) {
      out.push({
        type: 'reading',
        heading: moduleHeading,
        overview: whySlide.Overview,
        text: whySlide.Reading,
      });
    }

    if (misPairs.length) {
      out.push({
        type: 'misTable',
        heading: moduleHeading,
        overview: 'Common Misconceptions',
        pairs: misPairs,
      });
    }

    if (knowledgeSlide) {
      out.push({
        type: 'quiz',
        heading: moduleHeading,
        overview: knowledgeSlide.Overview || 'Knowledge Check',
        question: knowledgeSlide.Question,
        options: knowledgeSlide.Reading
          ? knowledgeSlide.Reading.split(/(?=[A-D]\.\s)/g).map((s) => s.trim()).filter(Boolean)
          : [],
        answer: knowledgeSlide.Answer?.trim() ?? '',
      });
    }

    setSlides(out);
  }, [rawContent]);

  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
  }, [currentIndex]);

  const handleNext = () => setCurrentIndex((i) => Math.min(i + 1, slides.length - 1));
  const handlePrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const current = slides[currentIndex];
  const handleOptionClick = (letter) => {
    setSelectedOption(letter);
    setShowFeedback(true);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!slides.length) return <p>No content available</p>;

  return (
    <div className="module-container">
      <h2 className="module-heading">{current.heading}</h2>
      <div className="module-content">
        <h3>{current.overview}</h3>

        {current.type === 'reading' && formatAsList(current.text)}

        {current.type === 'misTable' && (
          <table className="misconception-table">
            <thead>
              <tr>
                <th>Misconception</th>
                <th>Correction</th>
              </tr>
            </thead>
            <tbody>
              {current.pairs.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.misconception}</td>
                  <td>{row.correction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {current.type === 'quiz' && (
          <>
            <p className="reading-text">
              <strong>{current.question}</strong>
            </p>
            <ul className="knowledge-options">
              {current.options.map((opt, idx) => {
                const letter = opt.charAt(0);
                const isSelected = selectedOption === letter;
                const isCorrect = current.answer === letter;

                return (
                  <li
                    key={idx}
                    className={`option-item
                      ${showFeedback && isCorrect ? 'correct' : ''}
                      ${showFeedback && isSelected && !isCorrect ? 'incorrect' : ''}
                    `}
                    onClick={() => handleOptionClick(letter)}
                  >
                    {showFeedback && isCorrect && <span className="check-mark">✔️</span>}
                    {showFeedback && isSelected && !isCorrect && <span className="cross-mark">❌</span>}
                    {opt}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="nav-buttons">
        <button onClick={handlePrev} disabled={currentIndex === 0} className="prev-button">
          Prev
        </button>
        <button onClick={handleNext} disabled={currentIndex === slides.length - 1} className="next-button">
          Next
        </button>
      </div>
    </div>
  );
}
