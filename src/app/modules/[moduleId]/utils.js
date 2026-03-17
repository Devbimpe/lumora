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
