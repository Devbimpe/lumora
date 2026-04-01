import { NextResponse } from 'next/server';
import { getUserProgress, getUserModuleProgress, markContentViewed, markContentCompleted, markModuleCompleted, saveKnowledgeCheckFeedback } from '@db/admin-db.js';
import { SecurityHelper } from "@/src/app/lib/enforce-security.js";

// GET: Retrieve user progress
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const moduleId = url.searchParams.get('moduleId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const session = await SecurityHelper.verifyOwnership(request, userId);
    if (!session.valid) return NextResponse.json({ error: session.error }, { status: 403 });

    if (moduleId) {
      // Get progress for specific module
      const progress = await getUserModuleProgress(userId, moduleId);
      return NextResponse.json(progress || {
        userId,
        moduleId: parseInt(moduleId),
        viewedContent: [],
        completedContent: [],
        isCompleted: false,
        percentage: 0
      });
    } else {
      // Get all progress - ensure percentage is included for each
      const progress = await getUserProgress(userId);
      // Always recalculate percentage from current content/KC counts
      const progressWithPercentage = await Promise.all(
        progress.map(async (p) => {
          const updated = await getUserModuleProgress(userId, p.moduleId);
          return updated || { ...p, percentage: 0 };
        })
      );
      return NextResponse.json(progressWithPercentage);
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Update user progress
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, moduleId, action, contentId, userAnswer, grade, feedback } = body;

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'userId and moduleId are required' },
        { status: 400 }
      );
    }

    const session = await SecurityHelper.verifyOwnership(request, userId);
    if (!session.valid) return NextResponse.json({ error: session.error }, { status: 403 });

    let result;

    switch (action) {
      case 'view':
        if (!contentId) {
          return NextResponse.json(
            { error: 'contentId is required for view action' },
            { status: 400 }
          );
        }
        result = await markContentViewed(userId, moduleId, contentId);
        break;
      
      case 'complete':
        if (!contentId) {
          return NextResponse.json(
            { error: 'contentId is required for complete action' },
            { status: 400 }
          );
        }
        result = await markContentCompleted(userId, moduleId, contentId);
        break;
      
      case 'completeModule':
        result = await markModuleCompleted(userId, moduleId);
        break;

      case 'saveKnowledgeCheckFeedback':
        if (!contentId) {
          return NextResponse.json(
            { error: 'contentId is required for saveKnowledgeCheckFeedback action' },
            { status: 400 }
          );
        }
        result = await saveKnowledgeCheckFeedback(userId, moduleId, contentId, {
          userAnswer: userAnswer ?? '',
          grade: grade ?? null,
          feedback: feedback ?? ''
        });
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: view, complete, completeModule, or saveKnowledgeCheckFeedback' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, id: result });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress', details: error.message },
      { status: 500 }
    );
  }
}

