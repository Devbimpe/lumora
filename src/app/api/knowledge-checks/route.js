import { NextResponse } from 'next/server';
import { getKnowledgeChecksByModuleId } from '@db/db.js';

/**
 * GET handler: Retrieves knowledge checks for a module
 * Requires moduleId query parameter
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const moduleId = url.searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json(
        { error: 'moduleId query parameter is required' },
        { status: 400 }
      );
    }

    console.log('Fetching knowledge checks for moduleId:', moduleId);
    const knowledgeChecks = await getKnowledgeChecksByModuleId(moduleId);
    console.log(`Found ${knowledgeChecks.length} knowledge checks for module ${moduleId}`);

    return NextResponse.json(knowledgeChecks, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API GET error:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch knowledge checks',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

