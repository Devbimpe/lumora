import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

/*
  One-time migration to recalculate all userProgress percentage values.

  The old calculation counted image files in public/img/ and used a hard-coded
  fallback. The new calculation queries Firestore content docs + knowledge checks.

  Usage:
    node db/tools/migrateProgressPercentages.js           # live run
    node db/tools/migrateProgressPercentages.js --dry-run  # preview only
*/

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const DRY_RUN = process.argv.includes("--dry-run");

async function migrateProgressPercentages() {
  const { db } = await import("../firebase.js");
  const { COLLECTIONS, getContentByModuleId, getKnowledgeChecksByModuleId } = await import("../db.js");
  const { collection, getDocs, updateDoc } = await import("firebase/firestore");

  const progressRef = collection(db, COLLECTIONS.USER_PROGRESS);

  if (DRY_RUN) {
    console.log("DRY RUN – no documents will be modified.\n");
  }

  const snap = await getDocs(progressRef);

  // Cache total item counts per module to avoid redundant queries
  const totalItemsCache = {};

  async function getTotalItems(moduleId) {
    if (totalItemsCache[moduleId] !== undefined) return totalItemsCache[moduleId];

    const [contentPages, knowledgeChecks] = await Promise.all([
      getContentByModuleId(moduleId),
      getKnowledgeChecksByModuleId(moduleId)
    ]);

    const total = (contentPages?.length || 0) + (knowledgeChecks?.length || 0);
    totalItemsCache[moduleId] = total;
    return total;
  }

  let updatedCount = 0;
  let skippedCount = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const { userId, moduleId, viewedContent = [], completedContent = [] } = data;

    if (!userId || moduleId === undefined) {
      console.log(`Skipping ${docSnap.id} - missing userId or moduleId`);
      skippedCount++;
      continue;
    }

    const totalItems = await getTotalItems(moduleId);
    const uniqueViewed = new Set(viewedContent.map(id => String(id)));
    const newPercentage = totalItems > 0
      ? Math.min(Math.round((uniqueViewed.size / totalItems) * 100), 100)
      : 0;

    const oldPercentage = data.percentage ?? null;
    const oldIsCompleted = data.isCompleted ?? false;
    const newIsCompleted = newPercentage >= 100;

    const percentageChanged = oldPercentage !== newPercentage;
    const completionChanged = newIsCompleted && !oldIsCompleted;

    if (!percentageChanged && !completionChanged) {
      console.log(`✓ ${docSnap.id} already correct (${newPercentage}%${oldIsCompleted ? ', completed' : ''})`);
      skippedCount++;
      continue;
    }

    const changes = [];
    if (percentageChanged) changes.push(`${oldPercentage}% → ${newPercentage}%`);
    if (completionChanged) changes.push(`isCompleted: false → true`);
    console.log(`${docSnap.id}: ${changes.join(', ')}  (${uniqueViewed.size}/${totalItems} items viewed)`);

    if (!DRY_RUN) {
      const update = { percentage: newPercentage };
      if (completionChanged) {
        update.isCompleted = true;
        update.completedAt = new Date();
      }
      await updateDoc(docSnap.ref, update);
      updatedCount++;
    } else {
      updatedCount++;
    }
  }

  if (DRY_RUN) {
    console.log(`\nDry run complete. Would update ${updatedCount} documents (${skippedCount} unchanged).`);
  } else {
    console.log(`\nMigration complete. Updated ${updatedCount} documents (${skippedCount} unchanged).`);
  }
}

migrateProgressPercentages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
