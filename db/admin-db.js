import admin from 'firebase-admin';
import '@/firebaseAdmin.js'; // Ensure initialization
export const db = admin.firestore();

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  writeBatch,
  Timestamp,
  limit
} from './firestore-admin-polyfill.js';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  MODULES: 'modules',
  CONTENT: 'content',
  KNOWLEDGE_CHECKS: 'knowledgeChecks',
  STUDENT_SUBMISSIONS: 'studentSubmissions',
  FEEDBACK: 'feedback',
  USER_PROGRESS: 'userProgress'
};

// Tests the Firestore connection
export async function testConnection() {
  try {
    // Try to access a collection to test the connection
    const testRef = collection(db, '_connection_test');
    console.log('Firestore connection successful!');
    return true;
  } catch (error) {
    console.error('Firestore connection failed:', error.message);
    throw error;
  }
}

// ==================== USER OPERATIONS ====================

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}

/**
 * Get user by Firebase UID
 */
export async function getUserByFirebaseUid(firebaseUid) {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(usersRef, where('firebaseUid', '==', firebaseUid));
  const querySnapshot = await getDocs(q);

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
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return null;
  }

  return { id: userDoc.id, ...userDoc.data() };
}

/**
 * Get user by activation token
 */
export async function getUserByActivationToken(token) {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(
    usersRef,
    where('activationToken', '==', token),
    where('isActivated', '==', false)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}

/**
 * Get all users
 */
export async function getAllUsers() {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const querySnapshot = await getDocs(usersRef);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Create a new user
 */
export async function createUser(userData) {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const docRef = await addDoc(usersRef, {
    ...userData,
    role: userData.role || 'Student',
    percentModulesCompleted: userData.percentModulesCompleted || 0,
    isActivated: userData.isActivated || false,
    createdAt: Timestamp.now()
  });

  return docRef.id;
}

/**
 * Update user
 */
export async function updateUser(userId, updates) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

/**
 * Delete user and related data
 */
export async function deleteUser(userId) {
  const batch = writeBatch(db);

  // Delete user document
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  batch.delete(userRef);

  // Delete related student submissions
  const submissionsRef = collection(db, COLLECTIONS.STUDENT_SUBMISSIONS);
  const submissionsQuery = query(submissionsRef, where('studentId', '==', userId));
  const submissionsSnapshot = await getDocs(submissionsQuery);

  submissionsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}


// ==================== MODULE OPERATIONS ====================

/**
 * Get all modules
 */
export async function getAllModules() {
  const modulesRef = collection(db, COLLECTIONS.MODULES);
  const q = query(modulesRef, orderBy('moduleId', 'asc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getAllPublishedModules() {
  const modulesRef = collection(db, COLLECTIONS.MODULES);

  try {
    const q = query(modulesRef, where('published', '==', true), orderBy('moduleId', 'asc'));
    const querySnapshot = await getDocs(q);

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
  const modulesRef = collection(db, COLLECTIONS.MODULES);
  const q = query(modulesRef, where('moduleId', '==', parseInt(moduleId)));
  const querySnapshot = await getDocs(q);

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
  const modulesRef = collection(db, COLLECTIONS.MODULES);

  // Get the highest moduleId
  const allModules = await getAllModules();
  const maxModuleId = allModules.length > 0
    ? Math.max(...allModules.map(m => m.moduleId || 0))
    : 0;

  const docRef = await addDoc(modulesRef, {
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
  const modulesRef = collection(db, COLLECTIONS.MODULES);
  const q = query(modulesRef, where('moduleId', '==', parseInt(moduleId)));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Module not found');
  }

  const moduleDoc = querySnapshot.docs[0];
  await updateDoc(moduleDoc.ref, {
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
  const batch = writeBatch(db);

  // Find and delete the module
  const modulesRef = collection(db, COLLECTIONS.MODULES);
  const moduleQuery = query(modulesRef, where('moduleId', '==', parseInt(moduleId)));
  const moduleSnapshot = await getDocs(moduleQuery);

  if (moduleSnapshot.empty) {
    throw new Error('Module not found');
  }

  moduleSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete related content
  const contentRef = collection(db, COLLECTIONS.CONTENT);
  const contentQuery = query(contentRef, where('moduleId', '==', parseInt(moduleId)));
  const contentSnapshot = await getDocs(contentQuery);

  contentSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete all knowledge checks for this module (by moduleID), including unassociated
  // checks with no contentId. Deleting only by contentId misses those and leaves stale
  // rows that collide when module ids are reused after reindexing.
  const checksRef = collection(db, COLLECTIONS.KNOWLEDGE_CHECKS);
  const moduleChecksQuery = query(checksRef, where('moduleID', '==', parseInt(moduleId)));
  const moduleChecksSnapshot = await getDocs(moduleChecksQuery);

  const checkIdsForSubmissions = moduleChecksSnapshot.docs.map(
    (d) => d.data().knowledgeCheckId
  );

  moduleChecksSnapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  if (checkIdsForSubmissions.length > 0) {
    const submissionsRef = collection(db, COLLECTIONS.STUDENT_SUBMISSIONS);
    for (const checkId of checkIdsForSubmissions) {
      const submissionsQuery = query(submissionsRef, where('knowledgeCheckId', '==', checkId));
      const submissionsSnapshot = await getDocs(submissionsQuery);

      submissionsSnapshot.forEach((subDoc) => {
        batch.delete(subDoc.ref);
      });
    }
  }

  await batch.commit();

  // Remove learner progress for this module id so a later module that reuses the same
  // numeric id (after reindex / new create) does not inherit viewed/completed state.
  const progressRef = collection(db, COLLECTIONS.USER_PROGRESS);
  const progressQuery = query(progressRef, where('moduleId', '==', parseInt(moduleId)));
  const progressSnapshot = await getDocs(progressQuery);
  if (!progressSnapshot.empty) {
    let progressBatch = writeBatch(db);
    let ops = 0;
    for (const progressDoc of progressSnapshot.docs) {
      progressBatch.delete(progressDoc.ref);
      ops++;
      if (ops >= 400) {
        await progressBatch.commit();
        progressBatch = writeBatch(db);
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
  // Get all modules sorted by their current number
  const modules = await getAllModules();

  for (let i = 0; i < modules.length; i++) {
    const correctNumber = i + 1;
    const currentNumber = modules[i].moduleId;

    // Skip if already correct
    if (currentNumber === correctNumber) {
      continue;
    }

    // Update module number
    const moduleRef = doc(db, COLLECTIONS.MODULES, modules[i].id);
    await updateDoc(moduleRef, { moduleId: correctNumber });

    // Update content that references this module
    const contentRef = collection(db, COLLECTIONS.CONTENT);
    const contentDocs = await getDocs(query(contentRef, where('moduleId', '==', currentNumber)));
    for (const contentDoc of contentDocs.docs) {
      await updateDoc(contentDoc.ref, { moduleId: correctNumber });
    }

    // Update user progress that references this module (rename doc IDs too)
    const progressRef = collection(db, COLLECTIONS.USER_PROGRESS);
    const progressDocs = await getDocs(query(progressRef, where('moduleId', '==', currentNumber)));
    for (const progressDoc of progressDocs.docs) {
      const data = progressDoc.data();
      const newDocId = `${data.userId}_${correctNumber}`;

      if (progressDoc.id !== newDocId) {
        const newDocRef = doc(db, COLLECTIONS.USER_PROGRESS, newDocId);
        await setDoc(newDocRef, { ...data, moduleId: correctNumber }, { merge: true });
        await deleteDoc(progressDoc.ref);
      } else {
        await updateDoc(progressDoc.ref, { moduleId: correctNumber });
      }
    }

    // Update knowledge checks (note: uses moduleID with capital ID)
    const checksRef = collection(db, COLLECTIONS.KNOWLEDGE_CHECKS);
    const checksDocs = await getDocs(query(checksRef, where('moduleID', '==', currentNumber)));
    for (const checkDoc of checksDocs.docs) {
      await updateDoc(checkDoc.ref, { moduleID: correctNumber });
    }
  }
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
  // Build a map: oldModuleId -> newModuleId
  // e.g. newOrder = [3, 1, 2] means: 3->1, 1->2, 2->3
  const idMap = {};
  for (let i = 0; i < newOrder.length; i++) {
    idMap[newOrder[i]] = i + 1;
  }

  // Fetch everything we need in parallel (4 reads at once)
  const [moduleDocs, contentDocs, progressDocs, checksDocs] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.MODULES)),
    getDocs(collection(db, COLLECTIONS.CONTENT)),
    getDocs(collection(db, COLLECTIONS.USER_PROGRESS)),
    getDocs(collection(db, COLLECTIONS.KNOWLEDGE_CHECKS)),
  ]);

  // --- Phase 1: move each progress doc to a unique staging id (per user + old module id) ---
  const stagingEntries = [];
  {
    let batch = writeBatch(db);
    let ops = 0;
    const maybeCommit = async () => {
      if (ops >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        ops = 0;
      }
    };

    for (const d of progressDocs.docs) {
      const oldModuleId = d.data().moduleId;
      if (idMap[oldModuleId] === undefined) continue;
      const newModuleId = idMap[oldModuleId];
      const userId = d.data().userId;
      const stagingRef = doc(db, COLLECTIONS.USER_PROGRESS, `${userId}_stg_${oldModuleId}`);
      const data = { ...d.data(), moduleId: newModuleId };
      batch.set(stagingRef, data);
      batch.delete(d.ref);
      stagingEntries.push({ stagingRef, userId, newModuleId, data });
      ops += 2;
      await maybeCommit();
    }
    if (ops > 0) await batch.commit();
  }

  // --- Phase 2: staging -> final `${userId}_${newModuleId}` ---
  {
    let batch = writeBatch(db);
    let ops = 0;
    const maybeCommit = async () => {
      if (ops >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        ops = 0;
      }
    };

    for (const e of stagingEntries) {
      const finalRef = doc(db, COLLECTIONS.USER_PROGRESS, `${e.userId}_${e.newModuleId}`);
      batch.set(finalRef, e.data);
      batch.delete(e.stagingRef);
      ops += 2;
      await maybeCommit();
    }
    if (ops > 0) await batch.commit();
  }

  // --- Modules, content, knowledge checks (single batch; progress already migrated) ---
  const batch = writeBatch(db);

  for (const d of moduleDocs.docs) {
    const oldId = d.data().moduleId;
    if (idMap[oldId] !== undefined) {
      batch.update(d.ref, { moduleId: idMap[oldId] });
    }
  }

  for (const d of contentDocs.docs) {
    const oldId = d.data().moduleId;
    if (idMap[oldId] !== undefined) {
      batch.update(d.ref, { moduleId: idMap[oldId] });
    }
  }

  for (const d of checksDocs.docs) {
    const oldId = d.data().moduleID;
    if (idMap[oldId] !== undefined) {
      batch.update(d.ref, { moduleID: idMap[oldId] });
    }
  }

  await batch.commit();
}

/**
 * Toggle published status of a module
 */
export async function updateModulePublished(moduleId, published) {
  const modulesRef = collection(db, COLLECTIONS.MODULES);
  const q = query(modulesRef, where('moduleId', '==', parseInt(moduleId)));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Module not found');
  }

  const moduleDoc = querySnapshot.docs[0];
  await updateDoc(moduleDoc.ref, {
    published,
    updatedAt: Timestamp.now()
  });
}

// ==================== CONTENT OPERATIONS ====================

/**
 * Get content by module ID
 */
export async function getContentByModuleId(moduleId) {
  const contentRef = collection(db, COLLECTIONS.CONTENT);
  const q = query(
    contentRef,
    where('moduleId', '==', parseInt(moduleId)),
    orderBy('contentId', 'asc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Get content by content ID
 */
export async function getContentById(moduleId, contentId) {
  const contentRef = collection(db, COLLECTIONS.CONTENT);
  const q = query(contentRef, 
    where('contentId', '==', parseInt(contentId)), 
    where('moduleId', '==', parseInt(moduleId)));
  const querySnapshot = await getDocs(q);

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
  const contentRef = collection(db, COLLECTIONS.CONTENT);
  const q = query(contentRef, 
    where('contentId', '==', parseInt(contentId)), 
    where('moduleId', '==', parseInt(moduleId)));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Content not found');
  }

  const contentDoc = querySnapshot.docs[0];
  await updateDoc(contentDoc.ref, {
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
  const contentRef = collection(db, COLLECTIONS.CONTENT);

  // Get the highest contentId for this module
  const moduleContent = await getContentByModuleId(contentData.moduleId);
  const maxContentId = moduleContent.length > 0
    ? Math.max(...moduleContent.map(c => c.contentId || 0))
    : 0;

  const docRef = await addDoc(contentRef, {
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
  const contentRef = collection(db, COLLECTIONS.CONTENT);
  const q = query(
    contentRef,
    where('contentId', '==', parseInt(contentId)),
    where('moduleId', '==', parseInt(moduleId))
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Content not found');
  }

  await deleteDoc(querySnapshot.docs[0].ref);
  return { deleted: true };
}

// ==================== KNOWLEDGE CHECK OPERATIONS ====================

/**
 * Get knowledge checks by content ID
 */
export async function getKnowledgeChecksByContentId(contentId) {
  const checksRef = collection(db, COLLECTIONS.KNOWLEDGE_CHECKS);
  const q = query(checksRef, where('contentId', '==', parseInt(contentId)));
  const querySnapshot = await getDocs(q);

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
    const checksRef = collection(db, COLLECTIONS.KNOWLEDGE_CHECKS);
    const moduleIdNum = parseInt(moduleId);

    // Query without orderBy first to avoid index requirement
    // We'll sort in JavaScript instead
    const q = query(
      checksRef,
      where('moduleID', '==', moduleIdNum)
    );

    const querySnapshot = await getDocs(q);

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

  const checksRef = collection(db, COLLECTIONS.KNOWLEDGE_CHECKS);
  const docRef = await addDoc(checksRef, newCheck);

  return { id: docRef.id, ...newCheck };
}

/**
 * Delete a knowledge check by its knowledgeCheckId and moduleID
 */
export async function deleteKnowledgeCheck(knowledgeCheckId, moduleID) {
  const checksRef = collection(db, COLLECTIONS.KNOWLEDGE_CHECKS);
  const q = query(
    checksRef,
    where('knowledgeCheckId', '==', parseInt(knowledgeCheckId)),
    where('moduleID', '==', parseInt(moduleID))
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Knowledge check not found');
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();

  return { deleted: true };
}

/**
 * Update a knowledge check by its knowledgeCheckId and moduleID
 */
export async function updateKnowledgeCheck(knowledgeCheckId, moduleID, updates) {
  const checksRef = collection(db, COLLECTIONS.KNOWLEDGE_CHECKS);
  const q = query(
    checksRef,
    where('knowledgeCheckId', '==', parseInt(knowledgeCheckId)),
    where('moduleID', '==', parseInt(moduleID))
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Knowledge check not found');
  }

  const docRef = snapshot.docs[0].ref;
  await updateDoc(docRef, {
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
  const submissionsRef = collection(db, COLLECTIONS.STUDENT_SUBMISSIONS);

  const docRef = await addDoc(submissionsRef, {
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
  const feedbackRef = collection(db, COLLECTIONS.FEEDBACK);
  const usersRef = collection(db, COLLECTIONS.USERS);

  const [feedbackSnap, usersSnap] = await Promise.all([
    getDocs(feedbackRef),
    getDocs(usersRef),
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
  const progressRef = collection(db, COLLECTIONS.USER_PROGRESS);
  const usersRef = collection(db, COLLECTIONS.USERS);

  const [progressSnap, usersSnap] = await Promise.all([
    getDocs(progressRef),
    getDocs(usersRef),
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
  const submissionsRef = collection(db, COLLECTIONS.STUDENT_SUBMISSIONS);
  const q = query(submissionsRef, where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);

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
  const progressRef = collection(db, COLLECTIONS.USER_PROGRESS);
  const q = query(progressRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

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
  const progressRef = collection(db, COLLECTIONS.USER_PROGRESS);
  const q = query(
    progressRef,
    where('userId', '==', userId),
    where('moduleId', '==', parseInt(moduleId))
  );
  const querySnapshot = await getDocs(q);

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
  const progressDocRef = doc(db, COLLECTIONS.USER_PROGRESS, progressDocId);

  const payload = {
    ...progressData,
    userId,
    moduleId: moduleIdNum,
    updatedAt: Timestamp.now(),
  };

  // This will create it if missing, or update if it exists
  console.log('Setting doc:', progressDocId, payload);
  await setDoc(progressDocRef, payload, { merge: true });

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
  const feedbackRef = collection(db, COLLECTIONS.FEEDBACK);

  const docRef = await addDoc(feedbackRef, {
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
  const feedbackRef = collection(db, COLLECTIONS.FEEDBACK);
  const q = query(feedbackRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// For backward compatibility with existing code
export default {
  testConnection,
  getUserByEmail,
  getUserByUsername,
  getUserById,
  getUserByActivationToken,
  createUser,
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
  markContentViewed,
  markContentCompleted,
  updateModulePublished,
  markModuleCompleted,
  saveKnowledgeCheckFeedback
};
