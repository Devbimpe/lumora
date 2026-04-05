import admin from 'firebase-admin';
import '@/firebaseAdmin.js'; // Ensure admin is initialized

export const collection = (dbInstance, ...paths) => {
  if (paths.length === 1) {
    return typeof paths[0] === 'string' ? dbInstance.collection(paths[0]) : paths[0];
  }
  // Fallback for nested
  return dbInstance.collection(paths.join('/'));
};

export const doc = (dbInstance, ...paths) => {
  if (paths.length === 1) {
    return typeof paths[0] === 'string' ? dbInstance.doc(paths[0]) : paths[0];
  }
  if (paths.length === 2 && typeof paths[0] === 'string') {
    return dbInstance.collection(paths[0]).doc(paths[1]);
  }
  return paths[0].doc(paths[1]); // collectionRef.doc('123')
};

export const query = (ref, ...ops) => {
  let currentRef = ref;
  for (const op of ops) {
    if (typeof op === 'function') {
      currentRef = op(currentRef);
    }
  }
  return currentRef;
};

export const where = (field, op, val) => (ref) => ref.where(field, op, val);
export const orderBy = (field, dir) => (ref) => ref.orderBy(field, dir);
export const limit = (n) => (ref) => ref.limit(n);

export const getDocs = async (ref) => ref.get();
export const getDoc = async (ref) => {
  const snap = await ref.get();
  // Web SDK uses .exists() as a function, Admin SDK uses .exists as a boolean
  return {
    ...snap,
    id: snap.id,
    data: () => snap.data(),
    exists: () => snap.exists,
    ref: snap.ref
  };
};
export const addDoc = async (ref, data) => ref.add(data);
export const setDoc = async (ref, data, opts) => ref.set(data, opts);
export const updateDoc = async (ref, data) => ref.update(data);
export const deleteDoc = async (ref) => ref.delete();

export const writeBatch = (dbInstance) => dbInstance.batch();

export const Timestamp = admin.firestore.Timestamp;
