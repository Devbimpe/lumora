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
 * @property {string | undefined} activationToken
 * @property {Timestamp | undefined} activationTokenExpires
 * @property {number | undefined} percentModulesCompleted
 */
