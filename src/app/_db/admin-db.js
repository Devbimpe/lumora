import 'server-only'
import { cert as firebaseAdminCert, initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/app/_db/common';
import { performMigration } from '@/app/_db/admin-db-migration';
import { getAuth } from 'firebase-admin/auth';
/** @import { UserDoc } from '@/app/_db/common' */

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
      privateKey: process.env.FIREBASE_PRIVATE_KEY
    })
  });
  await performMigration();
}

const db = getFirestore();
const auth = getAuth();

// ==================== USER OPERATIONS ====================

export async function verifyIdToken(token) {
  return await auth.verifyIdToken(token);
}

/** Get user by doc ID. Should be the same as Firebase User ID after migration.
 * @returns {Promise<UserDoc | null>}
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
    ...snapshot.data()
  });
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
  const usersRef = db.collection(COLLECTIONS.USERS);
  const q = usersRef.where('email', '==', email);
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
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
 * Get user by username
 */
export async function getUserByUsername(username) {
  const usersRef = db.collection(COLLECTIONS.USERS);
  const q = usersRef.where('username', '==', username);
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}

/**
 * Get user by activation token
 */
export async function getUserByActivationToken(token) {
  const usersRef = db.collection(COLLECTIONS.USERS);
  const q = usersRef.where('activationToken', '==', token);
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}

/**
 * Get user by password reset token (validates token is not expired)
 */
export async function getUserByResetToken(token) {
  const usersRef = db.collection(COLLECTIONS.USERS);
  const q = usersRef
    .where('resetToken', '==', token);
  const querySnapshot = await q.get();

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();

  // Validate expiry — resetTokenExpires is stored as a Firestore Timestamp
  const expires = userData.resetTokenExpires;
  if (!expires) return null;

  // Handle both Firestore Timestamp objects and raw millisecond numbers
  const expiresMs = typeof expires.toMillis === 'function'
    ? expires.toMillis()
    : Number(expires);

  if (Date.now() > expiresMs) {
    return null; // Token has expired
  }

  return { id: userDoc.id, ...userData };
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
 */
export async function createUserDoc(userData) {
  const usersRef = db.collection(COLLECTIONS.USERS);
  const newDocRef = usersRef.doc();

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
 */
export async function updateUser(userId, updates) {
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
  const q = modulesRef.orderBy('moduleId', 'asc');
  const querySnapshot = await q.get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getAllPublishedModules() {
  const modulesRef = db.collection(COLLECTIONS.MODULES);

  try {
    const q = modulesRef.where('published', '==', true).orderBy('moduleId', 'asc');
    const querySnapshot = await q.get();

    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // results.sort((a, b) => {
    //   const aId = Number(a?.moduleId ?? 0);
    //   const bId = Number(b?.moduleId ?? 0);
    //   return aId - bId;
    // });

    return results;
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

  // Get the highest moduleId
  const allModules = await getAllModules();
  const maxModuleId = allModules.length > 0
    ? Math.max(...allModules.map(m => m.moduleId || 0))
    : 0;

  const docRef = await modulesRef.add({
    moduleId: maxModuleId + 1,
    heading: moduleData.heading,
    subheading: moduleData.subheading || moduleData.subHeading,
    createdAt: Timestamp.now(),
    faviconURL: moduleData.faviconURL || null
  });

  return { id: docRef.id, moduleId: maxModuleId + 1 };
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

  // Renumber remaining modules so there are no gaps
  await reindexModules();
}

/**
 * Renumber modules to remove gaps after deletion
 * Example: If modules are 1, 3, 4 -> becomes 1, 2, 3
 */
async function reindexModules() {
  throw new Error("to be reworked")
}

/**
 * Reorder modules based on a new ordering provided by the admin.
 * Takes an array of moduleIds in the desired new order.
 * Example: [3, 1, 2] means module 3 goes first, module 1 second, module 2 third.
 *
 * User progress doc IDs are `${userId}_${moduleId}`. Renaming them in a single batch
 * causes collisions when IDs permute (e.g. user_1 and user_2 swap targets): one write
 * overwrites or deletes another. We use a two-phase staging pass, then update modules,
 * content, and knowledge checks in one batch.
 */
export async function reorderModules(newOrder) {
  throw new Error("to be reworked")
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
 * Create a new knowledge check for a module
 */
export async function createKnowledgeCheck(data) {
  const { moduleID, contentId, question, choices, answer, explain, allowance } = data;

  const existing = await getKnowledgeChecksByModuleId(moduleID);
  const maxId = existing.reduce((max, c) => Math.max(max, c.knowledgeCheckId || 0), 0);

  const newCheck = {
    knowledgeCheckId: maxId + 1,
    moduleID: parseInt(moduleID),
    contentId: contentId ? parseInt(contentId) : null,
    question,
    choices,
    answer,
    explain: explain || '',
    allowance: allowance || '',
    createdAt: Timestamp.now()
  };

  const checksRef = db.collection(COLLECTIONS.KNOWLEDGE_CHECKS);
  const docRef = await checksRef.add(newCheck);

  return { id: docRef.id, ...newCheck };
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
 * Update a knowledge check by its knowledgeCheckId and moduleID
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

  const docRef = snapshot.docs[0].ref;
  await docRef.update({
    ...updates,
    updatedAt: Timestamp.now()
  });

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
export async function saveKnowledgeCheckFeedback(userId, moduleId, contentId, { userAnswer, grade, feedback }) {
  const progress = await getUserModuleProgress(userId, moduleId);
  const existing = progress?.knowledgeCheckSubmissions || {};
  const contentIdStr = String(contentId);

  const knowledgeCheckSubmissions = {
    ...existing,
    [contentIdStr]: {
      userAnswer: userAnswer ?? '',
      grade: grade ?? null,
      feedback: feedback ?? '',
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

// For backward compatibility with existing code
export default {
  getUserByEmail,
  getUserByUsername,
  getUserById,
  getUserByActivationToken,
  updateUser,
  deleteUser,
  getAllUsers,
  getAllModules,
  getAllPublishedModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getContentByModuleId,
  getContentById,
  updateContent,
  createContent,
  deleteContent,
  getKnowledgeChecksByContentId,
  getKnowledgeChecksByModuleId,
  getModuleWithContent,
  createStudentSubmission,
  getSubmissionsByStudentId,
  getAllModuleProgressWithUsers,
  getAllFeedbackWithUsers,
  createFeedback,
  getFeedbackByUserId,
  getUserProgress,
  getUserModuleProgress,
  updateUserModuleProgress,
  resetUserModuleProgress,
  markContentViewed,
  markContentCompleted,
  updateModulePublished,
  markModuleCompleted,
  saveKnowledgeCheckFeedback
};
