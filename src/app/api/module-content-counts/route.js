import { NextResponse } from 'next/server';
import { getAllModules, getContentByModuleId, getKnowledgeChecksByContentId } from '@db/db.js';

// GET: Get content counts for all modules or specific modules
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const moduleIds = url.searchParams.get('moduleIds'); // Comma-separated list

    let modulesToProcess = [];
    
    if (moduleIds) {
      // Get counts for specific modules
      const ids = moduleIds.split(',').map(id => parseInt(id.trim())).filter(Boolean);
      modulesToProcess = ids;
    } else {
      // Get counts for all modules
      const allModules = await getAllModules();
      modulesToProcess = allModules.map(m => m.moduleId);
    }

    const counts = {};

    // Process all modules in parallel
    await Promise.all(
      modulesToProcess.map(async (moduleId) => {
        try {
          const content = await getContentByModuleId(moduleId);
          
          if (!content || content.length === 0) {
            counts[moduleId] = 0;
            return;
          }

          // Process content the same way the module page does
          const processedContentIds = new Set();
          const contentMap = new Map();
          const misconceptionPairs = [];
          const correctionPairs = [];

          // Batch fetch all knowledge checks for this module's content
          const contentIds = content.map(c => c.contentId);
          const allChecksPromises = contentIds.map(id => getKnowledgeChecksByContentId(id));
          const allChecksResults = await Promise.all(allChecksPromises);
          const checksMap = new Map();
          allChecksResults.forEach((checks, index) => {
            if (checks && checks.length > 0) {
              checksMap.set(contentIds[index], checks);
            }
          });

          // First pass: collect all content items
          for (const contentItem of content) {
            if (!processedContentIds.has(contentItem.contentId)) {
              processedContentIds.add(contentItem.contentId);
              
              // Check if this content has knowledge checks (from batch fetch)
              const hasChecks = checksMap.has(contentItem.contentId);
              
              if (hasChecks) {
                // Knowledge check
                contentMap.set(contentItem.contentId, {
                  type: 'quiz',
                  contentId: contentItem.contentId
                });
              } else if (contentItem.overview && contentItem.overview.trim().toLowerCase() === 'common misconceptions') {
                // Misconception - will be paired with correction
                misconceptionPairs.push({ contentId: contentItem.contentId });
              } else if (contentItem.overview && contentItem.overview.trim().toLowerCase() === 'correction') {
                // Correction - will be paired with misconception
                correctionPairs.push({ contentId: contentItem.contentId });
              } else {
                // Regular reading content
                contentMap.set(contentItem.contentId, {
                  type: 'reading',
                  contentId: contentItem.contentId
                });
              }
            }
          }

          // Count sidebar items
          let sidebarCount = contentMap.size; // Regular content and quizzes
          
          // Add one for misconceptions table if we have pairs
          if (misconceptionPairs.length > 0 && correctionPairs.length > 0) {
            sidebarCount += 1;
          }

          counts[moduleId] = sidebarCount;
        } catch (error) {
          console.error(`Error counting content for module ${moduleId}:`, error);
          counts[moduleId] = 0;
        }
      })
    );

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error counting module content:', error);
    return NextResponse.json(
      { error: 'Failed to count module content', details: error.message },
      { status: 500 }
    );
  }
}

