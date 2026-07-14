export const COLLECTIONS = {
  USERS: 'users',
  MODULES: 'modules',
  CONTENT: 'content',
  KNOWLEDGE_CHECKS: 'knowledgeChecks',
  STUDENT_SUBMISSIONS: 'studentSubmissions',
  FEEDBACK: 'feedback',
  USER_PROGRESS: 'userProgress',
};

/**
 * @typedef {{ toDate: (this: Timestamp) => Date }} Timestamp
 */

/**
 * @typedef {Object} UserDoc
 * @property {'Admin' | 'Student'} role
 * @property {string} username
 * @property {string} name
 * @property {string} email
 * @property {Timestamp | undefined} updatedAt
 * @property {number | undefined} percentModulesCompleted
 * @property {string | undefined} activationToken
 * @property {Timestamp | undefined} activationTokenExpires
 * @property {string | undefined} resetToken
 * @property {Timestamp | undefined} resetTokenExpires
 */

/**
 * @typedef {Object} KnowledgeCheckBase
 * @property {number} knowledgeCheckId Per-module sequence id.
 * @property {number} moduleID
 * @property {number | null} contentId Optional association to a content page.
 * @property {'multiple-choice' | 'open-ended'} type Discriminator.
 * @property {string} question
 * @property {Timestamp} createdAt
 * @property {Timestamp | undefined} updatedAt
 */
/**
 * @typedef {KnowledgeCheckBase & {
 *   type: 'multiple-choice',
 *   choices: string[],
 *   correctAnswer: number,  // 0-based index into choices; the letter is display-only
 *   explanation: string,   // student-facing reveal shown after submission
 * }} MultipleChoiceKnowledgeCheck
 */
/**
 * @typedef {KnowledgeCheckBase & {
 *   type: 'open-ended',
 *   rubric: string,
 *   gradingContext: string, // (may be empty)
 *   aiGradingEnabled: boolean, // when false, explanation is shown instead of AI grading
 *   explanation: string, // student-facing reveal shown after submission when AI grading is disabled
 * }} OpenEndedKnowledgeCheck
 */
/** @typedef {MultipleChoiceKnowledgeCheck | OpenEndedKnowledgeCheck} KnowledgeCheck */

/** Comparator for module docs/DTOs ordered by `sortOrder`. */
export function compareModulesBySortOrder(a, b) {
  const aId = Number(a.ModuleID ?? a.moduleId ?? 0);
  const bId = Number(b.ModuleID ?? b.moduleId ?? 0);
  const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : aId;
  const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : bId;
  return aOrder - bOrder || aId - bId;
}
