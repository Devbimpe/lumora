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
 * @property {string} explanation Shared notes / context, shown to students for MC, grader context for open-ended.
 * @property {Timestamp} createdAt
 * @property {Timestamp | undefined} updatedAt
 */
/**
 * @typedef {KnowledgeCheckBase & {
 *   type: 'multiple-choice',
 *   choices: string[],
 *   correctAnswer: number,  // 0-based index into choices; the letter is display-only
 * }} MultipleChoiceKnowledgeCheck
 */
/**
 * @typedef {KnowledgeCheckBase & {
 *   type: 'open-ended',
 *   sampleAnswer: string,  // rubric for the AI grader
 * }} OpenEndedKnowledgeCheck
 */
/** @typedef {MultipleChoiceKnowledgeCheck | OpenEndedKnowledgeCheck} KnowledgeCheck */
