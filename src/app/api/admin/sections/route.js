import { NextResponse } from 'next/server';
import {
  getSectionsByModuleId,
  createSection,
  updateSection,
  deleteSection,
} from '@/app/_db/admin-db.js';
import {
  defineAdminRoute,
  badRequestError,
  internalServerError,
  validateJsonBody,
} from '@/app/_lib/route';

// GET handler: Retrieves sections for a module.
// Requires moduleId query parameter.
export const GET = defineAdminRoute(async (request) => {
  try {
    const moduleId = request.nextUrl.searchParams.get('moduleId');

    if (!moduleId) {
      return badRequestError('moduleId query parameter is required');
    }

    const sections = await getSectionsByModuleId(moduleId);
    return NextResponse.json(sections);
  } catch (error) {
    console.error('API GET sections error:', error);
    return internalServerError('Failed to fetch sections');
  }
});

// POST handler: Creates a section for a module.

export const POST = defineAdminRoute(async (request) => {
  try {
    const { body, validationError } = await validateJsonBody(request);
    if (validationError) return validationError;

    const { moduleId, title, description } = body;

    if (!moduleId || !title || !String(title).trim()) {
      return badRequestError('moduleId and title are required');
    }

    const created = await createSection({
      moduleId,
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('API POST sections error:', error);
    return internalServerError('Failed to create section');
  }
});

// PUT handler: Updates a section.

export const PUT = defineAdminRoute(async (request) => {
  try {
    const { body, validationError } = await validateJsonBody(request);
    if (validationError) return validationError;

    const { moduleId, sectionId, title, description } = body;

    if (!moduleId || !sectionId) {
      return badRequestError('moduleId and sectionId are required');
    }

    if (!title || !String(title).trim()) {
      return badRequestError('title is required');
    }

    await updateSection(moduleId, sectionId, {
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API PUT sections error:', error);
    return internalServerError('Failed to update section');
  }
});

// DELETE handler: Deletes a section.

export const DELETE = defineAdminRoute(async (request) => {
  try {
    const { body, validationError } = await validateJsonBody(request);
    if (validationError) return validationError;

    const { moduleId, sectionId } = body;

    if (!moduleId || !sectionId) {
      return badRequestError('moduleId and sectionId are required');
    }

    await deleteSection(moduleId, sectionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API DELETE sections error:', error);
    return internalServerError('Failed to delete section');
  }
});