import { NextResponse } from 'next/server';
import { getModuleWithContent } from '@db/admin-db.js';

// GET: Get the actual count of displayable content sections (sidebar items) for a module
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const moduleId = url.searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json(
        { error: 'moduleId is required' },
        { status: 400 }
      );
    }

    const module = await getModuleWithContent(moduleId);
    
    if (!module || !module.content) {
      return NextResponse.json({ count: 0 });
    }

    // Process content the same way the module page does
    const processedContentIds = new Set();
    const contentMap = new Map();
    const misconceptionPairs = [];
    const correctionPairs = [];

    // First pass: collect all content items
    module.content.forEach((content) => {
      if (!processedContentIds.has(content.contentId)) {
        processedContentIds.add(content.contentId);
        
        if (content.knowledgeChecks && content.knowledgeChecks.length > 0) {
          // Knowledge check
          contentMap.set(content.contentId, {
            type: 'quiz',
            contentId: content.contentId
          });
        } else if (content.overview && content.overview.trim().toLowerCase() === 'common misconceptions') {
          // Misconception - will be paired with correction
          misconceptionPairs.push({ contentId: content.contentId });
        } else if (content.overview && content.overview.trim().toLowerCase() === 'correction') {
          // Correction - will be paired with misconception
          correctionPairs.push({ contentId: content.contentId });
        } else {
          // Regular reading content
          contentMap.set(content.contentId, {
            type: 'reading',
            contentId: content.contentId
          });
        }
      }
    });

    // Count sidebar items
    let sidebarCount = contentMap.size; // Regular content and quizzes
    
    // Add one for misconceptions table if we have pairs
    if (misconceptionPairs.length > 0 && correctionPairs.length > 0) {
      sidebarCount += 1;
    }

    return NextResponse.json({ count: sidebarCount });
  } catch (error) {
    console.error('Error counting module content:', error);
    return NextResponse.json(
      { error: 'Failed to count module content', details: error.message },
      { status: 500 }
    );
  }
}

