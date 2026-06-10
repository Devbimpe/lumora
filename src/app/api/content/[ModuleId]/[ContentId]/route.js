// This is the code for edit the content 
import { NextResponse } from 'next/server';
import { updateContent, getContentById, deleteContent } from '@/app/_db/admin-db.js';

// GET handler: Retrieves certain content by ContentID and ModuleID
export async function GET(req, context) {
  try {
    const params = await context.params;
    const contentId = params.ContentId;
    const moduleId = params.ModuleId;

    const content = await getContentById(moduleId, contentId);

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({
      contentID: content.contentId,
      moduleID: content.moduleId,
      Objectverview: content.overview,
      Reading: content.reading,
      imageURL: content.image || null,
      imageDescription: content.imageDescription || null
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch content from database',
      details: error.message
    }, { status: 500 });
  }
}

// PUT handler: Updates content for a specific ContentID
// Expects a JSON body with 'Overview' and 'Reading' fields, and a ContentID from route parameters
export async function PUT(req, context) {
  try {
    const params = await context.params;
    const contentId = params.ContentId;
    const moduleId = params.ModuleId;
    
    const { Overview, Reading, imageURL, imageDescription } = await req.json();

    // Update content in Firestore
    await updateContent(moduleId, contentId, { Overview, Reading, imageURL, imageDescription });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// DELETE handler: Deletes content by ContentID and ModuleId
export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const contentId = params.ContentId;
    const moduleId = params.ModuleId;

    await deleteContent(contentId, moduleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json({
      error: 'Failed to delete content',
      details: error.message
    }, { status: 500 });
  }
}