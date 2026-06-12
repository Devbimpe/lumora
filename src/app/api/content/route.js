import { NextResponse } from 'next/server';
import { getContentByModuleId, createContent } from '@/app/_db/admin-db.js';
import {
  badRequestError,
  defineAdminRoute,
  defineUserRoute,
  internalServerError,
} from '@/app/lib/route';

// GET handler: Retrieves all content for a specific module
// Expects a 'moduleId' query parameter in the request URL
export const GET = defineUserRoute(async (request) => {
  try {
    const moduleId = request.nextUrl.searchParams.get('moduleId');

    if (!moduleId) {
      return badRequestError('Module ID is required');
    }

    const content = await getContentByModuleId(moduleId);

    // Transform to match expected format
    const formattedContent = content.map(item => ({
      ContentID: item.contentId,
      ModuleID: item.moduleId,
      Overview: item.overview,
      Reading: item.reading,
      ImageURL: item.image || null,
      ImageDescription: item.imageDescription || null
    }));

    return NextResponse.json(formattedContent);
  } catch (error) {
    console.error('API Error:', error);
    return internalServerError('Failed to fetch content from database');
  }
});

// POST handler: Create new content
export const POST = defineAdminRoute(async (request) => {
  try {
    const body = await request.json();
    const { moduleId, overview, reading, imageURL, imageDescription } = body;

    if (!moduleId || !overview || (!reading && !imageURL)) {
      return badRequestError('Module ID, overview, and either reading or image are required');
    }

    const result = await createContent({
      moduleId: parseInt(moduleId),
      overview,
      reading,
      imageURL,
      imageDescription
    });

    return NextResponse.json({
      success: true,
      contentId: result.contentId
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return internalServerError('Failed to create content');
  }
});
