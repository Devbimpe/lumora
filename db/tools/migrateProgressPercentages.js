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

  // Cache module metadata to avoid redundant queries
  const moduleCache = {};

  async function getModuleInfo(moduleId) {
    if (moduleCache[moduleId]) return moduleCache[moduleId];

    const [contentPages, knowledgeChecks] = await Promise.all([
      getContentByModuleId(moduleId),
      getKnowledgeChecksByModuleId(moduleId)
    ]);

    const kcIds = new Set((knowledgeChecks || []).map(kc => String(kc.knowledgeCheckId)));
    const total = (contentPages?.length || 0) + (knowledgeChecks?.length || 0);
    moduleCache[moduleId] = { total, kcIds };
    return moduleCache[moduleId];
  }

  // Prefix unprefixed KC IDs in an array, returns new array or null if unchanged
  function fixKcPrefixes(arr, kcIds) {
    let changed = false;
    const fixed = arr.map(id => {
      const s = String(id);
      if (!s.startsWith('kc-') && kcIds.has(s)) {
        changed = true;
        return `kc-${s}`;
      }
      return s;
    });
    return changed ? fixed : null;
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

    const { total: totalItems, kcIds } = await getModuleInfo(moduleId);

    // Fix unprefixed KC IDs in viewedContent and completedContent
    const fixedViewed = fixKcPrefixes(viewedContent, kcIds);
    const fixedCompleted = fixKcPrefixes(completedContent, kcIds);
    const currentViewed = fixedViewed || viewedContent.map(id => String(id));

    const uniqueViewed = new Set(currentViewed);
    const newPercentage = totalItems > 0
      ? Math.min(Math.round((uniqueViewed.size / totalItems) * 100), 100)
      : 0;

    const oldPercentage = data.percentage ?? null;
    const oldIsCompleted = data.isCompleted ?? false;
    const newIsCompleted = newPercentage >= 100;

    const percentageChanged = oldPercentage !== newPercentage;
    const completionChanged = newIsCompleted && !oldIsCompleted;
    const arraysChanged = fixedViewed || fixedCompleted;

    if (!percentageChanged && !completionChanged && !arraysChanged) {
      console.log(`✓ ${docSnap.id} already correct (${newPercentage}%${oldIsCompleted ? ', completed' : ''})`);
      skippedCount++;
      continue;
    }

    const changes = [];
    if (arraysChanged) changes.push('fix KC ID prefixes');
    if (percentageChanged) changes.push(`${oldPercentage}% → ${newPercentage}%`);
    if (completionChanged) changes.push(`isCompleted: false → true`);
    console.log(`${docSnap.id}: ${changes.join(', ')}  (${uniqueViewed.size}/${totalItems} items viewed)`);

    if (!DRY_RUN) {
      const update = { percentage: newPercentage };
      if (fixedViewed) update.viewedContent = fixedViewed;
      if (fixedCompleted) update.completedContent = fixedCompleted;
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
