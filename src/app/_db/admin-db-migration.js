import 'server-only'
import { COLLECTIONS } from '@/app/_db/common';
import { getFirestore } from 'firebase-admin/firestore';

export async function performMigration() {
  // All migrations have been completed.
}

// Ensures that the ID for a user document is the same as its `firebaseUid` field.
async function migrateUserDocumentId() {
  const db = getFirestore();
  const userRef = db.collection(COLLECTIONS.USERS);

  const usersSnapshot = await userRef.get();
  const usersNeedMigration = usersSnapshot.docs
    .filter((s) => {
      const { firebaseUid } = s.data();
      return firebaseUid && s.id !== firebaseUid;
    })
    .map((s) => s.ref);

  if (usersNeedMigration.length) {
    console.warn(
      `Migrating ${usersNeedMigration.length} user documents with inconsistent ID`,
    );
  }

  for (const oldDocRef of usersNeedMigration) {
    // Ensure atomic rename operation
    await db.runTransaction(async (t) => {
      // Load latest data within transaction
      const oldDoc = await t.get(oldDocRef);
      if (!oldDoc.exists) return; // Handle race condition -- ignore missing
      const newId = oldDoc.data().firebaseUid;

      const newDocRef = userRef.doc(newId);
      const newDoc = await t.get(newDocRef);
      if (newDoc.exists) return; // Handle race condition -- don't override

      t.set(newDocRef, oldDoc.data());
      t.delete(oldDocRef);
      console.log(`Migrated user ${newId}`);
    });
  }
}
