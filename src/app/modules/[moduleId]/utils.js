/** @import { KnowledgeCheck } from '@/app/_db/common' */

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

/**
 * Open-ended KC counts as done if submitted in the current session, a saved attempt
 * exists in progress, or progress marks the KC complete.
 */
export function isOpenEndedKCComplete(submissions, completedSet, selectedAnswers, knowledgeCheckId) {
  if (selectedAnswers[knowledgeCheckId] === '__submitted__') return true;
  if (completedSet.has(`kc-${knowledgeCheckId}`) || completedSet.has(String(knowledgeCheckId))) return true;
  const sub = submissions?.[knowledgeCheckId] ?? submissions?.[String(knowledgeCheckId)];
  return !!(sub && typeof sub === 'object');
}

/**
 * Whether a KC is complete, combining persisted progress and current session state.
 *
 * `item` is the student-side KC view model: `{ knowledgeCheckId, kcType, correctAnswer }`.
 * For MC, once a KC is marked complete (persisted or correct in-session), it stays
 * complete even if the user later picks a wrong answer.
 */
export function isKnowledgeCheckComplete(item, ctx = {}) {
  const { selectedAnswers = {}, completedSet = new Set(), submissions = {} } = ctx;
  const id = item.knowledgeCheckId;
  if (item.kcType === 'open-ended') {
    return isOpenEndedKCComplete(submissions, completedSet, selectedAnswers, id);
  }
  if (completedSet.has(`kc-${id}`) || completedSet.has(String(id))) return true;
  const ans = selectedAnswers[id];
  return ans !== undefined && ans === item.correctAnswer;
}

/** First item in module order that is not done per saved progress + current session (resume). */
export function findFirstIncompleteItem(items, viewedSet, completedSet, submissions, selectedAnswers = {}) {
  for (const item of items) {
    if (item.type === 'content') {
      if (item.contentId == null || !viewedSet.has(String(item.contentId))) {
        return item;
      }
      continue;
    }
    if (item.type === 'knowledgeCheck') {
      if (isKnowledgeCheckComplete(item, { selectedAnswers, completedSet, submissions })) continue;
      return item;
    }
  }
  return null;
}