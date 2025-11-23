import { NextResponse } from 'next/server';
import { getContentByModuleId, createContent } from '@db/db.js';
import { parse } from 'dotenv';

// GET handler: Retrieves all content for a specific module
// Expects a 'moduleId' query parameter in the request URL
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    
    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    const content = await getContentByModuleId(moduleId);
    
    // Transform to match expected format
    const formattedContent = content.map(item => ({
      ContentID: item.contentId,
      ModuleID: item.moduleId,
      Overview: item.overview,
      Reading: item.reading
    }));
    
    return NextResponse.json(formattedContent);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch content from database',
      details: error.message 
    }, { status: 500 });
  }
}

// POST handler: Create new content
export async function POST(request) {
  try {
    const body = await request.json();
    const { moduleId, overview, reading } = body;
    
    if (!moduleId || !overview || !reading) {
      return NextResponse.json({ 
        error: 'Module ID, overview, and reading are required' 
      }, { status: 400 });
    }

    const result = await createContent({
      moduleId: parseInt(moduleId),
      overview,
      reading
    });
    
    return NextResponse.json({ 
      success: true,
      contentId: result.contentId 
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to create content',
      details: error.message 
    }, { status: 500 });
  }
}
