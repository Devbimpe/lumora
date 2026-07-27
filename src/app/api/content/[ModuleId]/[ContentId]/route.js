// This is the code for edit the content 
import { NextResponse } from 'next/server';
import { updateContent, getContentById, deleteContent } from '@/app/_db/admin-db.js';
import {
  defineAdminRoute,
  defineUserRoute,
  internalServerError,
} from '@/app/_lib/route';

// GET handler: Retrieves certain content by ContentID and ModuleID
export const GET = defineUserRoute(async (req, session, ctx) => {
  try {
    const params = await ctx.params;
    const contentId = params.ContentId;
    const moduleId = params.ModuleId;

    const content = await getContentById(moduleId, contentId);

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({
      contentID: content.contentId,
      moduleID: content.moduleId,
      sectionId: content.sectionId ?? null,
      Objectverview: content.overview,
      Reading: content.reading,
      imageURL: content.image || null,
      imageDescription: content.imageDescription || null
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return internalServerError('Failed to fetch content from database');
  }
});

// PUT handler: Updates content for a specific ContentID
export const PUT = defineAdminRoute(async (req, session, ctx) => {
  try {
    const params = await ctx.params;
    const contentId = params.ContentId;
    const moduleId = params.ModuleId;
    
    const { Overview, Reading, sectionId, imageURL, imageDescription } = await req.json();

    // Update content in Firestore
    await updateContent(moduleId, contentId, { Overview, Reading, sectionId, imageURL, imageDescription });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});


// DELETE handler: Deletes content by ContentID and ModuleId
export const DELETE = defineAdminRoute(async (req, session, ctx) => {
  try {
    const params = await ctx.params;
    const contentId = params.ContentId;
    const moduleId = params.ModuleId;

    await deleteContent(contentId, moduleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API Error:', error);
    return internalServerError('Failed to delete content');
  }
});
