import { NextResponse } from 'next/server';
import { getUserProgress, getUserModuleProgress, markContentViewed, markContentCompleted, markModuleCompleted } from '@db/db.js';

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

    if (moduleId) {
      // Get progress for specific module
      const progress = await getUserModuleProgress(userId, moduleId);
      return NextResponse.json(progress || {
        userId,
        moduleId: parseInt(moduleId),
        viewedContent: [],
        completedContent: [],
        isCompleted: false
      });
    } else {
      // Get all progress
      const progress = await getUserProgress(userId);
      return NextResponse.json(progress);
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
    const { userId, moduleId, action, contentId } = body;

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'userId and moduleId are required' },
        { status: 400 }
      );
    }

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
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: view, complete, or completeModule' },
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

