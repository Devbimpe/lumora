import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";


/* This was used to migrate the module progress document IDs from a random UID to a consistent format of `${userId}_${moduleId}`. This change was made due to a change the in db.js logic to use this format for easier querying and to prevent duplicates. 

To run this migration, use `node db/tools/migrateModProgressIDfromRandToUID_MODID.js` from the project root. It will read all documents in the USER_PROGRESS collection, create new documents with the correct ID format, and delete the old documents. Use the `--dry-run` flag to see what changes would be made without actually modifying the database. Always back up your database before running migrations.
*/



// Load env from project root before any Firebase imports
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const DRY_RUN = process.argv.includes("--dry-run");

async function migrateUserProgressIds() {
  const { db } = await import("../firebase.js");
  const { COLLECTIONS } = await import("../db.js");
  const { collection, getDocs, doc, setDoc, deleteDoc } = await import("firebase/firestore");

  const progressRef = collection(db, COLLECTIONS.USER_PROGRESS);

  if (DRY_RUN) {
    console.log("DRY RUN – no documents will be modified.\n");
  }

  const snap = await getDocs(progressRef);
  
  let migratedCount = 0;
  let skippedCount = 0;

  for (const docSnap of snap.docs) {
    const oldId = docSnap.id;
    const data = docSnap.data();

    if (!data.userId || data.moduleId === undefined) {
      console.log(`Skipping ${oldId} - missing userId or moduleId`);
      skippedCount++;
      continue;
    }

    const newId = `${data.userId}_${Number(data.moduleId)}`;

    // Skip if already using correct format
    if (oldId === newId) {
      console.log(`✓ ${oldId} already has correct ID format`);
      skippedCount++;
      continue;
    }

    console.log(`Migrating: ${oldId} → ${newId}`);

    if (!DRY_RUN) {
      // Create new document with correct ID
      const newDocRef = doc(db, COLLECTIONS.USER_PROGRESS, newId);
      await setDoc(newDocRef, data, { merge: true });

      // Delete old document
      await deleteDoc(docSnap.ref);
      
      migratedCount++;
    } else {
      console.log(`  [dry run] would create ${newId} and delete ${oldId}`);
      migratedCount++;
    }
  }

  if (DRY_RUN) {
    console.log(`\nDry run complete. Would migrate ${migratedCount} documents (${skippedCount} skipped).`);
  } else {
    console.log(`\nMigration complete. Migrated ${migratedCount} documents (${skippedCount} skipped).`);
  }
}

migrateUserProgressIds()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });