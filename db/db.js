import { db } from './firebase.js';
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
  Timestamp
} from 'firebase/firestore';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  MODULES: 'modules',
  CONTENT: 'content',
  KNOWLEDGE_CHECKS: 'knowledgeChecks',
  STUDENT_SUBMISSIONS: 'studentSubmissions'
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
    createdAt: Timestamp.now()
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
    updatedAt: Timestamp.now()
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
  
  const contentIds = contentSnapshot.docs.map(doc => doc.data().contentId);
  
  contentSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // Delete related knowledge checks
  if (contentIds.length > 0) {
    const checksRef = collection(db, COLLECTIONS.KNOWLEDGE_CHECKS);
    for (const contentId of contentIds) {
      const checksQuery = query(checksRef, where('contentId', '==', contentId));
      const checksSnapshot = await getDocs(checksQuery);
      
      const checkIds = checksSnapshot.docs.map(doc => doc.data().knowledgeCheckId);
      
      checksSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete related student submissions
      if (checkIds.length > 0) {
        const submissionsRef = collection(db, COLLECTIONS.STUDENT_SUBMISSIONS);
        for (const checkId of checkIds) {
          const submissionsQuery = query(submissionsRef, where('knowledgeCheckId', '==', checkId));
          const submissionsSnapshot = await getDocs(submissionsQuery);
          
          submissionsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
        }
      }
    }
  }
  
  await batch.commit();
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
export async function getContentById(contentId) {
  const contentRef = collection(db, COLLECTIONS.CONTENT);
  const q = query(contentRef, where('contentId', '==', parseInt(contentId)));
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
export async function updateContent(contentId, updates) {
  const contentRef = collection(db, COLLECTIONS.CONTENT);
  const q = query(contentRef, where('contentId', '==', parseInt(contentId)));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error('Content not found');
  }
  
  const contentDoc = querySnapshot.docs[0];
  await updateDoc(contentDoc.ref, {
    overview: updates.Overview || updates.overview,
    reading: updates.Reading || updates.reading,
    updatedAt: Timestamp.now()
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
    createdAt: Timestamp.now()
  });
  
  return { id: docRef.id, contentId: maxContentId + 1 };
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
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getContentByModuleId,
  getContentById,
  updateContent,
  createContent,
  getKnowledgeChecksByContentId,
  getModuleWithContent,
  createStudentSubmission,
  getSubmissionsByStudentId
};
