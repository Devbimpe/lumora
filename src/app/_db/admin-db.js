import 'server-only'
import { cert as firebaseAdminCert, initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { COLLECTIONS, compareModulesBySortOrder } from '@/app/_db/common';
import { performMigration } from '@/app/_db/admin-db-migration';
import { getAuth } from 'firebase-admin/auth';
/** @import { UserDoc, KnowledgeCheck } from '@/app/_db/common' */

/** @typedef {UserDoc & { uid: string }} UserDocWithId */

// Re-export for the rest of the app
export { Timestamp };

if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error('Missing Firebase admin credentials in env');
}

if (!getApps().length) {
  initializeApp({
    credential: firebaseAdminCert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
 // await performMigration();
}

const db = getFirestore();
const auth = getAuth();

// ==================== USER OPERATIONS ====================

export async function verifyIdToken(token) {
  return await auth.verifyIdToken(token);
}

/** Get user by doc ID. Should be the same as Firebase User ID after migration.
 * @returns {Promise<UserDocWithId | null>}
*/
export async function getUserById(uid) {
  const usersRef = db.collection(COLLECTIONS.USERS);
  let snapshot = await usersRef.doc(uid).get();

  if (!snapshot.exists) {
    // Legacy fallback
    const queryResult = await usersRef.where('firebaseUid', '==', uid).get();
    if (queryResult.empty) return null;
    if (queryResult.size > 1) console.warn(`multiple user documents returned for ${uid}`);
    snapshot = queryResult.docs[0];
  }

  if (!snapshot.exists) return null;

  let warned = false;
  return Object.freeze({
    get id() {
      if (!warned) {
        warned = true;
        console.warn('`id` property in user document is deprecated');
      }
      return uid;
    },
    ...snapshot.data(),
    uid,
  });
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
  let uid;
  try {
    const userRecord = await auth.getUserByEmail(email);
    uid = userRecord.uid;
  } catch {
    return null;
  }

  return await getUserById(uid);
}

/**
 * Get user by Firebase UID
 * @deprecated use `getUserById` instead
 */
export async function getUserByFirebaseUid(firebaseUid) {
  const usersRef = db.collection(COLLECTIONS.USERS);
  const q = usersRef.where('firebaseUid', '==', firebaseUid);
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}

/**
 * Get user by activation token
 * @returns {Promise<UserDocWithId | null>}
 */
export async function getUserByActivationToken(token) {
  const usersRef = db.collection(COLLECTIONS.USERS);
  const q = usersRef.where('activationToken', '==', token).limit(1);
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return { uid: userDoc.id, ...userDoc.data() };
}

/**
 * Get user by password reset token
 * @returns {Promise<UserDocWithId | null>}
 */
export async function getUserByResetToken(token) {
  const usersRef = db.collection(COLLECTIONS.USERS);
  const q = usersRef.where('resetToken', '==', token).limit(1);
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return { uid: userDoc.id, ...userDoc.data() };
}

/**
 * Get all users
 */
export async function* getAllUsers() {
  const usersRef = db.collection(COLLECTIONS.USERS);
  const querySnapshot = await usersRef.get();

  const chunkSize = 100; // Firebase Auth query limit
  for (let i = 0; i < querySnapshot.docs.length; i += chunkSize) {
    const chunk = querySnapshot.docs.slice(i, i + chunkSize);
    const lookup = new Map();
    for (const doc of chunk)
      lookup.set(doc.id, doc);
    
    const { users: firebaseUsers } = await auth.getUsers(chunk.map(doc => ({ uid: doc.id })));
    for (const firebaseUser of firebaseUsers) {
      const doc = lookup.get(firebaseUser.uid);
      if (doc)
        yield {
          account: firebaseUser,
          doc: /** @type {UserDoc} */ (doc.data())
        }
    }
  }
}

/**
 * Create a new user account in Firebase Auth
 * @param {import('firebase-admin/auth').CreateRequest} req 
 */
export function createUserAccount(req) {
  return auth.createUser(req);
}

/**
 * Create a new user document
 * @param {Partial<UserDoc>} userData 
 */
export async function createUserDoc(userData) {
  const usersRef = db.collection(COLLECTIONS.USERS);
  const newDocRef = usersRef.doc();

  // Use transaction to prevent race condition with usernames
  const error = await db.runTransaction(async t => {
    if (userData.username) {
      const existingUsername = await t.get(usersRef.where('username', '==', userData.username).limit(1));
      if (!existingUsername.empty) return 'Username is already in use';
    }

    t.create(newDocRef, userData);
  });

  return { uid: newDocRef.id, error };
}

/**
 * Update user document
 * @param {{ [K in keyof UserDoc]?: UserDoc[K] | null }} updates 
 */
export async function updateUser(userId, updates) {
  if ('role' in updates && updates.role !== 'Student') {
    throw new Error("safe guard: cannot update user role using this function");
  }

  const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
  await userRef.update({
    ...updates,
    updatedAt: Timestamp.now()
  });
}

/**
 * Update user account in Firebase Auth
 * @param {string} uid 
 * @param {import('firebase-admin/auth').UpdateRequest} updates 
 */
export function updateUserAccount(uid, updates) {
  return auth.updateUser(uid, updates);
}

/**
 * Delete user and related data
 */
export async function deleteUser(userId) {
  const batch = db.batch();

  // Delete user document
  const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
  batch.delete(userRef);

  // Delete related student submissions
  const submissionsRef = db.collection(COLLECTIONS.STUDENT_SUBMISSIONS);
  const submissionsQuery = submissionsRef.where('studentId', '==', userId);
  const submissionsSnapshot = await submissionsQuery.get();

  submissionsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await auth.deleteUser(userId);
  await batch.commit();
}

// ==================== MODULE OPERATIONS ====================

/**
 * Get all modules
 */
export async function getAllModules() {
  const modulesRef = db.collection(COLLECTIONS.MODULES);
  const querySnapshot = await modulesRef.get();

  return querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .sort(compareModulesBySortOrder);
}

export async function getAllPublishedModules() {
  const modulesRef = db.collection(COLLECTIONS.MODULES);

  try {
    const q = modulesRef.where('published', '==', true);
    const querySnapshot = await q.get();

    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort(compareModulesBySortOrder);
  } catch (error) {
    throw new Error(`Error fetching published modules: ${error.message}`);
  }
}

/**
 * Get module by ID
 */
export async function getModuleById(moduleId) {
  const modulesRef = db.collection(COLLECTIONS.MODULES);
  const q = modulesRef.where('moduleId', '==', parseInt(moduleId));
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    return null;
  }

  const moduleDoc = querySnapshot.docs[0];
  return { id: moduleDoc.id, ...moduleDoc.data() };
}

/**
 * Create a new module
 */
export async function createModule(moduleData) {
  const modulesRef = db.collection(COLLECTIONS.MODULES);

  const allModules = await getAllModules();

  const maxModuleId = allModules.length > 0
    ? Math.max(...allModules.map(m => Number(m.moduleId) || 0))
    : 0;

  const maxSortOrder = allModules.length > 0
    ? Math.max(...allModules.map(m => Number(m.sortOrder ?? m.moduleId) || 0))
    : 0;

  const newModuleId = maxModuleId + 1;
  const newSortOrder = maxSortOrder + 1;

  const docRef = await modulesRef.add({
    moduleId: newModuleId,
    sortOrder: newSortOrder,
    heading: moduleData.heading,
    subheading: moduleData.subheading || moduleData.subHeading,
    createdAt: Timestamp.now(),
    faviconURL: moduleData.faviconURL || null
  });

  return { id: docRef.id, moduleId: newModuleId, sortOrder: newSortOrder };
}

/**
 * Update module
 */
export async function updateModule(moduleId, updates) {
  const modulesRef = db.collection(COLLECTIONS.MODULES);
  const q = modulesRef.where('moduleId', '==', parseInt(moduleId));
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    throw new Error('Module not found');
  }

  const moduleDoc = querySnapshot.docs[0];
  await moduleDoc.ref.update({
    heading: updates.heading,
    subheading: updates.subheading || updates.subHeading,
    updatedAt: Timestamp.now(),
    faviconURL: updates.faviconURL || null
  });
}

/**
 * Delete module and related data
 */
export async function deleteModule(moduleId) {
  const batch = db.batch();

  // Find and delete the module
  const modulesRef = db.collection(COLLECTIONS.MODULES);
  const moduleQuery = modulesRef.where('moduleId', '==', parseInt(moduleId));
  const moduleSnapshot = await moduleQuery.get();

  if (moduleSnapshot.empty) {
    throw new Error('Module not found');
  }

  moduleSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete related content
  const contentRef = db.collection(COLLECTIONS.CONTENT);
  const contentQuery = contentRef.where('moduleId', '==', parseInt(moduleId));
  const contentSnapshot = await contentQuery.get();

  contentSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete all knowledge checks for this module (by moduleID), including unassociated
  // checks with no contentId. Deleting only by contentId misses those and leaves stale
  // rows that collide when module ids are reused after reindexing.
  const checksRef = db.collection(COLLECTIONS.KNOWLEDGE_CHECKS);
  const moduleChecksQuery = checksRef.where('moduleID', '==', parseInt(moduleId));
  const moduleChecksSnapshot = await moduleChecksQuery.get();

  const checkIdsForSubmissions = moduleChecksSnapshot.docs.map(
    (d) => d.data().knowledgeCheckId
  );

  moduleChecksSnapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  if (checkIdsForSubmissions.length > 0) {
    const submissionsRef = db.collection(COLLECTIONS.STUDENT_SUBMISSIONS);
    for (const checkId of checkIdsForSubmissions) {
      const submissionsQuery = submissionsRef.where('knowledgeCheckId', '==', checkId);
      const submissionsSnapshot = await submissionsQuery.get();

      submissionsSnapshot.forEach((subDoc) => {
        batch.delete(subDoc.ref);
      });
    }
  }

  await batch.commit();

  // Remove learner progress for this module id so a later module that reuses the same
  // numeric id (after reindex / new create) does not inherit viewed/completed state.
  const progressRef = db.collection(COLLECTIONS.USER_PROGRESS);
  const progressQuery = progressRef.where('moduleId', '==', parseInt(moduleId));
  const progressSnapshot = await progressQuery.get();
  if (!progressSnapshot.empty) {
    let progressBatch = db.batch();
    let ops = 0;
    for (const progressDoc of progressSnapshot.docs) {
      progressBatch.delete(progressDoc.ref);
      ops++;
      if (ops >= 400) {
        await progressBatch.commit();
        progressBatch = db.batch();
        ops = 0;
      }
    }
    if (ops > 0) {
      await progressBatch.commit();
    }
  }

  // Do not renumber modules after delete.
  // moduleId must stay stable so existing user progress does not get corrupted.
}



/**
 * Reorder modules based on a new ordering provided by the admin.
 * Takes an array of moduleIds in the desired new order.
 * Updates only sortOrder so moduleId stays stable.
 */
export async function reorderModules(newOrder) {
  if (!Array.isArray(newOrder)) {
    throw new Error('Invalid module order');
  }

  const modulesRef = db.collection(COLLECTIONS.MODULES);
  const batch = db.batch();

  for (let index = 0; index < newOrder.length; index++) {
    const moduleId = parseInt(newOrder[index]);

    if (Number.isNaN(moduleId)) {
      throw new Error(`Invalid moduleId in reorder list: ${newOrder[index]}`);
    }

    const moduleQuery = modulesRef.where('moduleId', '==', moduleId).limit(1);
    const moduleSnapshot = await moduleQuery.get();

    if (moduleSnapshot.empty) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    const moduleDoc = moduleSnapshot.docs[0];

    batch.update(moduleDoc.ref, {
      sortOrder: index + 1,
      updatedAt: Timestamp.now()
    });
  }

  await batch.commit();

  return { success: true };
}

/**
 * Toggle published status of a module
 */
export async function updateModulePublished(moduleId, published) {
  const modulesRef = db.collection(COLLECTIONS.MODULES);
  const q = modulesRef.where('moduleId', '==', parseInt(moduleId));
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    throw new Error('Module not found');
  }

  const moduleDoc = querySnapshot.docs[0];
  await moduleDoc.ref.update({
    published,
    updatedAt: Timestamp.now()
  });
}

// ==================== CONTENT OPERATIONS ====================

/**
 * Get content by module ID
 */
export async function getContentByModuleId(moduleId) {
  const contentRef = db.collection(COLLECTIONS.CONTENT);
  const q = contentRef
    .where('moduleId', '==', parseInt(moduleId))
    .orderBy('contentId', 'asc');
  const querySnapshot = await q.get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Get content by content ID
 */
export async function getContentById(moduleId, contentId) {
  const contentRef = db.collection(COLLECTIONS.CONTENT);
  const q = contentRef
    .where('contentId', '==', parseInt(contentId))
    .where('moduleId', '==', parseInt(moduleId));
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    return null;
  }

  const contentDoc = querySnapshot.docs[0];
  return { id: contentDoc.id, ...contentDoc.data() };
}

/**
 * Update content
 */
export async function updateContent(moduleId, contentId, updates) {
  const contentRef = db.collection(COLLECTIONS.CONTENT);
  const q = contentRef
    .where('contentId', '==', parseInt(contentId))
    .where('moduleId', '==', parseInt(moduleId));
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    throw new Error('Content not found');
  }

  const contentDoc = querySnapshot.docs[0];
  await contentDoc.ref.update({
    overview: updates.Overview ?? updates.overview ?? '',
    reading: updates.Reading ?? updates.reading ?? '',
    updatedAt: Timestamp.now(),
    image: updates.imageURL ?? updates.Image ?? updates.image ?? null,
    imageDescription: updates.imageDescription ?? updates.ImageDescription ?? null
  });
}

/**
 * Create content
 */
export async function createContent(contentData) {
  const contentRef = db.collection(COLLECTIONS.CONTENT);

  // Get the highest contentId for this module
  const moduleContent = await getContentByModuleId(contentData.moduleId);
  const maxContentId = moduleContent.length > 0
    ? Math.max(...moduleContent.map(c => c.contentId || 0))
    : 0;

  const docRef = await contentRef.add({
    contentId: maxContentId + 1,
    moduleId: parseInt(contentData.moduleId),
    overview: contentData.overview,
    reading: contentData.reading,
    createdAt: Timestamp.now(),
    image: contentData.imageURL || contentData.image || null,
    imageDescription: contentData.imageDescription || null
  });

  return { id: docRef.id, contentId: maxContentId + 1 };
}

/**
 * Delete content by contentId and moduleId
 */
export async function deleteContent(contentId, moduleId) {
  const contentRef = db.collection(COLLECTIONS.CONTENT);
  const q = contentRef
    .where('contentId', '==', parseInt(contentId))
    .where('moduleId', '==', parseInt(moduleId));
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    throw new Error('Content not found');
  }

  await querySnapshot.docs[0].ref.delete();
  return { deleted: true };
}

// ==================== KNOWLEDGE CHECK OPERATIONS ====================

/**
 * Get knowledge checks by content ID
 */
export async function getKnowledgeChecksByContentId(contentId) {
  const checksRef = db.collection(COLLECTIONS.KNOWLEDGE_CHECKS);
  const q = checksRef.where('contentId', '==', parseInt(contentId));
  const querySnapshot = await q.get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Get knowledge checks by module ID
 */
export async function getKnowledgeChecksByModuleId(moduleId) {
  try {
    const checksRef = db.collection(COLLECTIONS.KNOWLEDGE_CHECKS);
    const moduleIdNum = parseInt(moduleId);

    // Query without orderBy first to avoid index requirement
    // We'll sort in JavaScript instead
    const q = checksRef
      .where('moduleID', '==', moduleIdNum);

    const querySnapshot = await q.get();

    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by knowledgeCheckId in JavaScript
    results.sort((a, b) => {
      const aId = a.knowledgeCheckId || 0;
      const bId = b.knowledgeCheckId || 0;
      return aId - bId;
    });

    return results;
  } catch (error) {
    console.error('Error fetching knowledge checks by module ID:', error);
    console.error('Module ID:', moduleId);
    throw error;
  }
}

/**
 * Get a single knowledge check by (moduleId, knowledgeCheckId).
 * @returns {Promise<(KnowledgeCheck & { id: string }) | null>}
 */
export async function getKnowledgeCheck(knowledgeCheckId, moduleID) {
  const checksRef = db.collection(COLLECTIONS.KNOWLEDGE_CHECKS);
  const q = checksRef
    .where('knowledgeCheckId', '==', parseInt(knowledgeCheckId))
    .where('moduleID', '==', parseInt(moduleID));
  const snapshot = await q.get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

/**
 * Build a Firestore KC document for a given type.
 * @param {KnowledgeCheck} fields
 * @returns {KnowledgeCheck}
 */
function buildKnowledgeCheckDoc(fields) {
  return /** @type {KnowledgeCheck} */ ({
    knowledgeCheckId: fields.knowledgeCheckId,
    moduleID: fields.moduleID,
    contentId: fields.contentId ?? null,
    type: fields.type,
    question: fields.question,
    createdAt: fields.createdAt,
    ...(fields.type === 'multiple-choice'
      ? {
          choices: fields.choices || [],
          correctAnswer: fields.correctAnswer ?? 0,
          explanation: fields.explanation || '',
        }
      : {
          rubric: fields.rubric || '',
          gradingContext: fields.gradingContext || '',
          aiGradingEnabled: !!fields.aiGradingEnabled,
          explanation: fields.explanation || '',
        }),
  });
}

/**
 * Create a new knowledge check for a module.
 * @param {Omit<KnowledgeCheck, 'knowledgeCheckId' | 'createdAt' | 'updatedAt'>} data
 * @returns {Promise<KnowledgeCheck & { id: string }>}
 */
export async function createKnowledgeCheck(data) {
  const { moduleID, contentId, type, question, explanation, choices, correctAnswer, rubric, gradingContext, aiGradingEnabled } = data;
  const moduleIdNum = parseInt(moduleID);
  const checksRef = db.collection(COLLECTIONS.KNOWLEDGE_CHECKS);

  const { ref, newCheck } = await db.runTransaction(async (t) => {
    // Query within the transaction so the max id we compute is consistent with the write.
    const snap = await t.get(checksRef.where('moduleID', '==', moduleIdNum));
    const maxId = snap.docs.reduce((max, d) => Math.max(max, d.data().knowledgeCheckId || 0), 0);
    const ref = checksRef.doc();

    const newCheck = buildKnowledgeCheckDoc({
      knowledgeCheckId: maxId + 1,
      moduleID: moduleIdNum,
      contentId: contentId ? parseInt(contentId) : null,
      type,
      question,
      explanation,
      createdAt: Timestamp.now(),
      choices,
      correctAnswer,
      rubric,
      gradingContext,
      aiGradingEnabled,
    });

    t.create(ref, newCheck);
    return { ref, newCheck };
  });

  return { id: ref.id, ...newCheck };
}

/**
 * Delete a knowledge check by its knowledgeCheckId and moduleID
 */
export async function deleteKnowledgeCheck(knowledgeCheckId, moduleID) {
  const checksRef = db.collection(COLLECTIONS.KNOWLEDGE_CHECKS);
  const q = checksRef
    .where('knowledgeCheckId', '==', parseInt(knowledgeCheckId))
    .where('moduleID', '==', parseInt(moduleID));
  const snapshot = await q.get();

  if (snapshot.empty) {
    throw new Error('Knowledge check not found');
  }

  const batch = db.batch();
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();

  return { deleted: true };
}

/**
 * Update a knowledge check by its knowledgeCheckId and moduleID.
 * @param {number} knowledgeCheckId
 * @param {number} moduleID
 * @param {Partial<Omit<KnowledgeCheck, 'knowledgeCheckId' | 'moduleID' | 'contentId' | 'createdAt' | 'updatedAt'>>} updates
 */
export async function updateKnowledgeCheck(knowledgeCheckId, moduleID, updates) {
  const checksRef = db.collection(COLLECTIONS.KNOWLEDGE_CHECKS);
  const q = checksRef
    .where('knowledgeCheckId', '==', parseInt(knowledgeCheckId))
    .where('moduleID', '==', parseInt(moduleID));
  const snapshot = await q.get();

  if (snapshot.empty) {
    throw new Error('Knowledge check not found');
  }

  const existing = snapshot.docs[0].data();
  const type = updates.type;
  if (type !== 'multiple-choice' && type !== 'open-ended') {
    throw new Error('Invalid knowledge check type');
  }

  const doc = buildKnowledgeCheckDoc({
    knowledgeCheckId: existing.knowledgeCheckId,
    moduleID: existing.moduleID,
    contentId: updates.contentId != null ? parseInt(updates.contentId) : null,
    type,
    question: updates.question,
    explanation: updates.explanation,
    createdAt: existing.createdAt,
    choices: updates.choices,
    correctAnswer: updates.correctAnswer,
    rubric: updates.rubric,
    gradingContext: updates.gradingContext,
    aiGradingEnabled: updates.aiGradingEnabled,
  });

  await snapshot.docs[0].ref.set({ ...doc, updatedAt: Timestamp.now() });
  return { updated: true };
}

/**
 * Get module with content and knowledge checks
 */
export async function getModuleWithContent(moduleId) {
  const module = await getModuleById(moduleId);

  if (!module) {
    return null;
  }

  const content = await getContentByModuleId(moduleId);

  // Get knowledge checks for each content
  const contentWithChecks = await Promise.all(
    content.map(async (contentItem) => {
      const checks = await getKnowledgeChecksByContentId(contentItem.contentId);
      return {
        ...contentItem,
        knowledgeChecks: checks
      };
    })
  );

  return {
    ...module,
    content: contentWithChecks
  };
}

// ==================== STUDENT SUBMISSION OPERATIONS ====================

/**
 * Create a student submission
 */
export async function createStudentSubmission(submissionData) {
  const submissionsRef = db.collection(COLLECTIONS.STUDENT_SUBMISSIONS);

  const docRef = await submissionsRef.add({
    knowledgeCheckId: parseInt(submissionData.knowledgeCheckId),
    studentId: submissionData.studentId,
    submissionAnswer: submissionData.submissionAnswer,
    grade: submissionData.grade || null,
    createdAt: Timestamp.now()
  });

  return docRef.id;
}

// Fetch Feedback for Admin Dashboard

/**
 * Get all feedback with merged user details
 */
export async function getAllFeedbackWithUsers() {
  const feedbackRef = db.collection(COLLECTIONS.FEEDBACK);
  const usersRef = db.collection(COLLECTIONS.USERS);

  const [feedbackSnap, usersSnap] = await Promise.all([
    feedbackRef.get(),
    usersRef.get(),
  ]);

  const usersMap = {};
  usersSnap.forEach((u) => (usersMap[u.id] = u.data()));

  return feedbackSnap.docs.map((doc) => {
    const f = doc.data();
    const user = usersMap[f.userId] || {};

    let readableType = "Unknown";

    if (f.type === "General") {
      readableType = "General Feedback";
    } else if (!isNaN(f.type)) {
      readableType = `Module ${f.type} Feedback`;
    }

    return {
      id: doc.id,
      ...f,
      displayType: readableType,
      userName: user.username || "N/A",
      fullName: user.name || "N/A",
    };
  });
}

// Fetch User-Progress for Admin Dashboard

/**
 * Get all user module progress with merged user details
 * Uses stored percentage from userProgress docs
 */
export async function getAllModuleProgressWithUsers() {
  const progressRef = db.collection(COLLECTIONS.USER_PROGRESS);
  const usersRef = db.collection(COLLECTIONS.USERS);

  const [progressSnap, usersSnap] = await Promise.all([
    progressRef.get(),
    usersRef.get(),
  ]);

  // Map users by id
  const usersMap = {};
  usersSnap.forEach((u) => (usersMap[u.id] = u.data()));

  return progressSnap.docs.map((doc) => {
    const p = doc.data();
    const user = usersMap[p.userId] || {};

    // Use stored percentage (0–100), fallback to 0 if missing
    let rawPercentage =
      typeof p.percentage === "number" && !Number.isNaN(p.percentage)
        ? p.percentage
        : 0;

    // Clamp between 0 and 100
    rawPercentage = Math.min(Math.max(rawPercentage, 0), 100);

    // Completed flag comes from Firestore
    const completed = !!p.isCompleted;

    // If module is marked completed but percentage is still 0,
    // force it to show as 100% in the UI.
    const progressFraction = completed ? 1 : rawPercentage / 100;

    return {
      id: doc.id,
      ...p,
      userName: user.username || "N/A",
      fullName: user.name || "N/A",
      progress: progressFraction, // 0–1 value for UI
      completed,
    };
  });
}

/**
 * Get submissions by student ID
 */
export async function getSubmissionsByStudentId(studentId) {
  const submissionsRef = db.collection(COLLECTIONS.STUDENT_SUBMISSIONS);
  const q = submissionsRef.where('studentId', '==', studentId);
  const querySnapshot = await q.get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// ==================== USER PROGRESS OPERATIONS ====================

/**
 * Get user progress for all modules
 */
export async function getUserProgress(userId) {
  const progressRef = db.collection(COLLECTIONS.USER_PROGRESS);
  const q = progressRef.where('userId', '==', userId);
  const querySnapshot = await q.get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Get user progress for a specific module
 * Always includes percentage field
 */
export async function getUserModuleProgress(userId, moduleId) {
  const progressRef = db.collection(COLLECTIONS.USER_PROGRESS);
  const q = progressRef
    .where('userId', '==', userId)
    .where('moduleId', '==', parseInt(moduleId));
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    // Return default progress with 0% if no progress exists
    return {
      userId,
      moduleId: parseInt(moduleId),
      viewedContent: [],
      completedContent: [],
      isCompleted: false,
      percentage: 0
    };
  }

  const data = querySnapshot.docs[0].data();

  // Always recalculate from current content/KC counts
  data.percentage = await calculateModuleProgress(
    userId,
    moduleId,
    data.viewedContent || [],
    data.completedContent || []
  );

  // Auto-complete modules that have reached 100%
  if (data.percentage >= 100 && !data.isCompleted) {
    data.isCompleted = true;
    data.completedAt = Timestamp.now();
    await updateUserModuleProgress(userId, moduleId, {
      isCompleted: true,
      completedAt: Timestamp.now()
    });
  }

  return {
    id: querySnapshot.docs[0].id,
    ...data
  };
}

/**
 * Update or create user progress for a module
 */
export async function updateUserModuleProgress(userId, moduleId, progressData) {
  const moduleIdNum = parseInt(moduleId);

  const progressDocId = `${userId}_${moduleIdNum}`;
  const progressDocRef = db.collection(COLLECTIONS.USER_PROGRESS).doc(progressDocId);

  const payload = {
    ...progressData,
    userId,
    moduleId: moduleIdNum,
    updatedAt: Timestamp.now(),
  };

  // This will create it if missing, or update if it exists
  console.log('Setting doc:', progressDocId, payload);
  await progressDocRef.set(payload, { merge: true });

  return progressDocId;
}

/**
 * Reset user progress for a module
 */
export async function resetUserModuleProgress(userId, moduleId) {
  const moduleIdNum = parseInt(moduleId);
  const progressDocId = `${userId}_${moduleIdNum}`;
  const progressDocRef = db.collection(COLLECTIONS.USER_PROGRESS).doc(progressDocId);

  const resetPayload = {
    userId,
    moduleId: moduleIdNum,
    completedContent: [],
    knowledgeCheckSubmissions: {},
    lastCompletedAt: null,
    lastCompletedContentId: null,
    percentage: 0,
    viewedContent: [],
    updatedAt: Timestamp.now(),
  };

  await progressDocRef.set(resetPayload); // No merge — full overwrite

  return progressDocId;
}

/**
 * Calculate progress percentage for a module
 * Based on total items (content pages + knowledge checks) viewed
 */
async function calculateModuleProgress(userId, moduleId, viewedItems = [], completedItems = []) {
  try {
    const [contentPages, knowledgeChecks] = await Promise.all([
      getContentByModuleId(moduleId),
      getKnowledgeChecksByModuleId(moduleId)
    ]);

    const totalItems = (contentPages?.length || 0) + (knowledgeChecks?.length || 0);

    if (totalItems === 0) return 0;

    const uniqueViewed = new Set(viewedItems.map(id => String(id)));
    const percentage = Math.round((uniqueViewed.size / totalItems) * 100);

    return Math.min(percentage, 100);
  } catch (error) {
    console.error('Error calculating module progress:', error);
    return 0;
  }
}

/**
 * Mark content as viewed
 */
export async function markContentViewed(userId, moduleId, contentId) {
  const progress = await getUserModuleProgress(userId, moduleId);

  const viewedContent = progress?.viewedContent || [];
  const contentIdStr = String(contentId);
  if (!viewedContent.includes(contentIdStr)) {
    viewedContent.push(contentIdStr);
  }

  const completedContent = progress?.completedContent || [];

  // Calculate percentage
  const percentage = await calculateModuleProgress(userId, moduleId, viewedContent, completedContent);

  return await updateUserModuleProgress(userId, moduleId, {
    viewedContent,
    completedContent,
    lastViewedContentId: contentIdStr,
    lastViewedAt: Timestamp.now(),
    percentage: percentage,
    isCompleted: percentage >= 100
  });
}

/**
 * Mark content as completed (for quizzes, when answered correctly)
 */
export async function markContentCompleted(userId, moduleId, contentId) {
  const progress = await getUserModuleProgress(userId, moduleId);

  const completedContent = progress?.completedContent || [];
  const contentIdStr = String(contentId);
  if (!completedContent.includes(contentIdStr)) {
    completedContent.push(contentIdStr);
  }

  const viewedContent = progress?.viewedContent || [];
  if (!viewedContent.includes(contentIdStr)) {
    viewedContent.push(contentIdStr);
  }

  // Calculate percentage
  const percentage = await calculateModuleProgress(userId, moduleId, viewedContent, completedContent);

  // Check if module is completed (all items viewed)
  const totalItems = viewedContent.length;
  const isCompleted = percentage >= 100;

  return await updateUserModuleProgress(userId, moduleId, {
    viewedContent,
    completedContent,
    lastCompletedContentId: contentIdStr,
    lastCompletedAt: Timestamp.now(),
    percentage: percentage,
    isCompleted: isCompleted
  });
}

/**
 * Mark module as completed
 */
export async function markModuleCompleted(userId, moduleId) {
  const progress = await getUserModuleProgress(userId, moduleId);
  const viewedContent = progress?.viewedContent || [];
  const completedContent = progress?.completedContent || [];

  // Calculate final percentage
  const percentage = await calculateModuleProgress(userId, moduleId, viewedContent, completedContent);

  return await updateUserModuleProgress(userId, moduleId, {
    isCompleted: true,
    completedAt: Timestamp.now(),
    percentage: 100 // Set to 100% when module is completed
  });
}

/**
 * Save user answer and AI feedback for a knowledge check to module progress.
 * Overwrites any previous submission for the same contentId (reattempt).
 */
export async function saveKnowledgeCheckFeedback(userId, moduleId, contentId, {
  userAnswer, grade, feedback, maxGrade, model, graderReasoning, aiGradingEnabled,
}) {
  const progress = await getUserModuleProgress(userId, moduleId);
  const existing = progress?.knowledgeCheckSubmissions || {};
  const contentIdStr = String(contentId);

  const knowledgeCheckSubmissions = {
    ...existing,
    [contentIdStr]: {
      userAnswer: userAnswer ?? '',
      grade: grade ?? null,
      feedback: feedback ?? '',
      maxGrade: maxGrade ?? null,
      model: model ?? null,
      graderReasoning: graderReasoning ?? null,
      aiGradingEnabled: aiGradingEnabled ?? null,
      updatedAt: Timestamp.now()
    }
  };

  return await updateUserModuleProgress(userId, moduleId, {
    knowledgeCheckSubmissions
  });
}

// ==================== FEEDBACK OPERATIONS ====================

/**
 * Create a feedback entry
 */
export async function createFeedback(feedbackData) {
  const feedbackRef = db.collection(COLLECTIONS.FEEDBACK);

  const docRef = await feedbackRef.add({
    userId: feedbackData.userId,
    message: feedbackData.message,
    type: feedbackData.type, // 'General' (string) or module ID (number/string)
    createdAt: Timestamp.now()
  });

  return docRef.id;
}

/**
 * Get feedback by user ID
 */
export async function getFeedbackByUserId(userId) {
  const feedbackRef = db.collection(COLLECTIONS.FEEDBACK);
  const q = feedbackRef.where('userId', '==', userId).orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
