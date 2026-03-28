// Helper function to parse choices into array of options
// Handles both array of strings and single string format
export function parseChoices(choices) {
  if (!choices) return [];

  // If choices is already an array of strings
  if (Array.isArray(choices)) {
    return choices.map((choice, index) => {
      // Try to extract letter and text from string like "A: text" or "A. text"
      const match = choice.match(/^([A-D])[\.:]\s*(.+)/);
      if (match) {
        return {
          letter: match[1],
          text: match[2].trim()
        };
      }
      // Fallback: use index as letter (A=0, B=1, etc.)
      return {
        letter: String.fromCharCode(65 + index), // 65 is 'A'
        text: choice.trim()
      };
    }).sort((a, b) => a.letter.localeCompare(b.letter));
  }

  // If choices is a string, parse it (backward compatibility)
  const choicesString = choices;
  const regex = /([A-D]):\s*"([^"]+)"/g;
  const options = [];
  let match;

  while ((match = regex.exec(choicesString)) !== null) {
    options.push({
      letter: match[1],
      text: match[2]
    });
  }

  // If regex didn't work, try simpler split
  if (options.length === 0) {
    const parts = choicesString.split(/(?=[A-D]\.\s)/g);
    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed) {
        const letterMatch = trimmed.match(/^([A-D])[\.:]\s*(.+)/);
        if (letterMatch) {
          options.push({
            letter: letterMatch[1],
            text: letterMatch[2].trim()
          });
        }
      }
    });
  }

  return options.sort((a, b) => a.letter.localeCompare(b.letter));
}

// If the API ever returned raw JSON as feedback (e.g. after parse failure), show only the message text
export function normalizeGradeFeedback(grade, feedback) {
  if (feedback && typeof feedback === 'string' && feedback.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(feedback);
      return { grade: parsed.Grade ?? grade, feedback: parsed.Feedback ?? feedback };
    } catch {
      return { grade, feedback };
    }
  }
  return { grade, feedback };
}

/** First item in module order that is not done per saved progress (resume). */
export function findFirstIncompleteItem(items, viewedSet, completedSet, submissions) {
  for (const item of items) {
    if (item.type === 'content') {
      if (item.contentId == null || !viewedSet.has(String(item.contentId))) {
        return item;
      }
      continue;
    }
    if (item.type === 'knowledgeCheck') {
      const id = item.knowledgeCheckId;
      if (completedSet.has(`kc-${id}`) || completedSet.has(String(id))) {
        continue;
      }
      const isDescriptive = !item.choices || item.choices.length === 0;
      if (isDescriptive) {
        const sub = submissions?.[id] ?? submissions?.[String(id)];
        if (sub && typeof sub === 'object') continue;
      }
      return item;
    }
  }
  return null;
}

/** Descriptive KC counts as done for navigation / module complete if submitted in session, saved attempt exists, or progress marks kc complete. */
export function isDescriptiveKCComplete(submissions, completedSet, selectedAnswers, knowledgeCheckId) {
  if (selectedAnswers[knowledgeCheckId] === '__submitted__') return true;
  if (completedSet.has(`kc-${knowledgeCheckId}`) || completedSet.has(String(knowledgeCheckId))) return true;
  const sub = submissions?.[knowledgeCheckId] ?? submissions?.[String(knowledgeCheckId)];
  return !!(sub && typeof sub === 'object');
}
