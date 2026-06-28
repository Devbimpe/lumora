export function validateKC(form) {
  if (!form.question || !form.question.trim()) {
    return 'Question is required';
  }
  if (form.type === 'multiple-choice') {
    const filled = (form.choices || []).filter((c) => typeof c === 'string' && c.trim());
    if (filled.length < 2) {
      return 'At least 2 choices are required';
    }
    const idx = Number(form.correctAnswer);
    if (!Number.isInteger(idx) || idx < 0 || idx >= filled.length) {
      return 'Please select the correct answer';
    }
  }
  return null;
}

export function buildKCPayload(form) {
  const base = {
    type: form.type,
    question: form.question,
    explanation: form.explanation || '',
  };
  if (form.type === 'multiple-choice') {
    const filled = (form.choices || []).filter((c) => typeof c === 'string' && c.trim());
    return { ...base, choices: filled, correctAnswer: Number(form.correctAnswer) };
  }
  return { ...base, sampleAnswer: form.sampleAnswer || '' };
}