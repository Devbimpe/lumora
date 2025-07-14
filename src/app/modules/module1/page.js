'use client';
import { useEffect, useState } from 'react';
import '../Module.css';


export default function Module1() {
  const [content, setContent] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch('/api/users/Module');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, content.length - 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (content.length === 0) return <p>No content available</p>;

  const currentSection = content[currentIndex];

return (
  <div className="module-container">
    <h2 className="module-heading">{currentSection.title}</h2>

    <div
      className="module-content"
      dangerouslySetInnerHTML={{ __html: currentSection.content_html }}
    />

    <div className="nav-buttons">
      <button onClick={handlePrev} disabled={currentIndex === 0} className="prev-button">
        Prev
      </button>
      <button onClick={handleNext} disabled={currentIndex === content.length - 1} className='next-button'>
        Next
      </button>
    </div>
  </div>
);

}
