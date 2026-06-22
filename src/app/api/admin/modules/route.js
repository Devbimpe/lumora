import { NextResponse } from 'next/server';
import {
  getAllModules,
  createModule,
  deleteModule as _deleteModule,
  updateModule as _updateModule,
  reorderModules,
  updateModulePublished,
  getContentByModuleId,
} from '@/app/_db/admin-db.js';
import {
  badRequestError,
  defineAdminRoute,
  internalServerError,
  validateJsonBody,
} from '@/app/_lib/route';

// Retrieves all modules from the database
// Returns a JSON response with formatted module data
async function getModules() {
  const modules = await getAllModules();

  // Transform to match expected format
  const formattedModules = modules.map(module => ({
    id: module.moduleId,
    Heading: module.heading,
    SubHeading: module.subheading,
    published: module.published ?? false,
    faviconURL: module.faviconURL || null
  }));

  return NextResponse.json(formattedModules);
}

// Adds a new module to the database
// Expects an object with 'heading' and 'subHeading' properties
// Returns the inserted module's ID on success
async function addModule({ heading, subHeading, faviconURL }) {
  const result = await createModule({ heading, subheading: subHeading, faviconURL});
  return { success: true, id: result.moduleId };
}

// Deletes a module and its related data (submissions, knowledge checks, content)
// Expects a module ID as input
async function deleteModule(id) {
  await _deleteModule(id);
  return { success: true };
}

// Updates an existing module's heading and subheading
async function updateModule({ id, heading, subHeading, faviconURL }) {
  await _updateModule(id, {
    heading,
    subheading: subHeading,
    faviconURL: faviconURL || null
  });
  return { success: true, id };
}

// Reorders modules based on admin's drag-and-drop arrangement
async function reorderModulesHandler({ order }) {
  await reorderModules(order);
  return { success: true };
}

// GET handler: Retrieves all modules
export const GET = defineAdminRoute(async (req) => {
  try {
    return await getModules();
  } catch (error) {
    console.error('API error:', error);
    return internalServerError();
  }
});

// POST handler: Creates a new module
export const POST = defineAdminRoute(async (req) => {
  try {
    const { body, validationError } = await validateJsonBody(req);
    if (validationError) return validationError;
    const { heading, subHeading, faviconURL } = body;

    if (!heading || !subHeading) {
      return badRequestError('Missing heading or sub-heading');
    }

    const result = await addModule({ heading, subHeading, faviconURL });
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Route error:', error);
    return internalServerError('Failed to add module');
  }
});

// DELETE handler: Deletes a module by ID
export const DELETE = defineAdminRoute(async (req) => {
  try {
    const { body, validationError } = await validateJsonBody(req);
    if (validationError) return validationError;
    const { id } = body;

    if (!id) {
      return badRequestError('Missing ID');
    }

    const result = await deleteModule(id);
    return NextResponse.json(result);
  } catch (error) {
    return internalServerError('Failed to delete module');
  }
});

// PUT handler: Updates a module's heading and subheading
export const PUT = defineAdminRoute(async (req) => {
  try {
    const { body, validationError } = await validateJsonBody(req);
    if (validationError) return validationError;
    const { id, heading, subHeading, faviconURL } = body;

    if (!id || !heading || !subHeading) {
      return badRequestError('Missing module ID, heading, or sub-heading');
    }

    const result = await updateModule({ id, heading, subHeading, faviconURL });
    return NextResponse.json(result);
  } catch (error) {
    return internalServerError(error.message || 'Failed to update module');
  }
});

// PATCH handler: Handles both reordering and publish toggling
export const PATCH = defineAdminRoute(async (req) => {
  try {
    const { body, validationError } = await validateJsonBody(req);
    if (validationError) return validationError;
    const { order, id, published } = body;

    // Handle reorder request
    if (order) {
      if (!Array.isArray(order) || order.length === 0) {
        return badRequestError('Invalid order array');
      }
      const result = await reorderModulesHandler({ order });
      return NextResponse.json(result);
    }

    // Handle publish toggle request
    if (id !== undefined && published !== undefined) {
      // Prevent publishing a module with no content
      if (published === true) {
        const content = await getContentByModuleId(id);
        if (content.length === 0) {
          return badRequestError("This module cannot be published because it has no content. Please add content before publishing.");
        }
      }

      await updateModulePublished(id, published);
      return NextResponse.json({ success: true });
    }

    // Neither reorder nor publish
    return badRequestError('Invalid PATCH request');
  } catch (error) {
    console.error('❌ PATCH route error:', error);
    return internalServerError(error.message || 'Failed to process request');
  }
});
