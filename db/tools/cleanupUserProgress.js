import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";


// This file was used to delete duplicate user progress documents that were created due to a bug in the progress update logic. It identifies duplicates by grouping documents with the same userId and moduleId, then keeps the most complete and recent one while deleting the others.


// Load env from project root before any Firebase imports (same as Next.js .env.local)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const DRY_RUN = process.argv.includes("--dry-run");

function getTimestamp(doc) {
  return (
    doc.updatedAt?.toMillis?.() ??
    doc.createdAt?.toMillis?.() ??
    0
  );
}

async function cleanupUserProgress() {
  // Use same Firebase connection as app (db.js / firebase.js)
  const { db } = await import("../firebase.js");
  const { COLLECTIONS } = await import("../db.js");
  const { collection, getDocs, doc, deleteDoc } = await import("firebase/firestore");

  const progressRef = collection(db, COLLECTIONS.USER_PROGRESS);

  if (DRY_RUN) {
    console.log("DRY RUN – no documents will be deleted.\n");
  }

  const snap = await getDocs(progressRef);

  // Group docs by userId + moduleId (normalize moduleId so "1" and 1 match)
  const groups = {};

  snap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.userId || data.moduleId === undefined) return;

    const key = `${data.userId}_${Number(data.moduleId)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push({ id: docSnap.id, ...data });
  });

  let deleteCount = 0;

  for (const key of Object.keys(groups)) {
    const docs = groups[key];
    if (docs.length <= 1) continue;

    // Sort by best doc first
    docs.sort((a, b) => {
      // Prefer completed
      if (a.isCompleted && !b.isCompleted) return -1;
      if (!a.isCompleted && b.isCompleted) return 1;

      // Prefer newest timestamp
      return getTimestamp(b) - getTimestamp(a);
    });

    const keep = docs[0];
    const toDelete = docs.slice(1);

    console.log(`Keeping ${keep.id}, deleting ${toDelete.length} duplicates for ${key}`);

    if (!DRY_RUN) {
      for (const d of toDelete) {
        await deleteDoc(doc(db, COLLECTIONS.USER_PROGRESS, d.id));
        deleteCount++;
      }
    } else {
      toDelete.forEach((d) => console.log(`  [dry run] would delete ${d.id}`));
      deleteCount += toDelete.length;
    }
  }

  if (DRY_RUN) {
    console.log(`\nDry run complete. Would delete ${deleteCount} duplicate documents.`);
  } else {
    console.log(`Cleanup complete. Deleted ${deleteCount} duplicate documents.`);
  }
}

cleanupUserProgress()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  });
