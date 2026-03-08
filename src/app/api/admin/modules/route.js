import { NextResponse } from 'next/server';
import { getAllModules } from "@db/db.js";

// Retrieves all modules from the database
// Returns a JSON response with formatted module data
async function getModules() {
  try {
    console.log('✅ Database connected');

    const modules = await getAllModules();

    // Transform to match expected format
    const formattedModules = modules.map(module => ({
      id: module.moduleId,
      Heading: module.heading,
      SubHeading: module.subheading,
      published: module.published ?? false,
      faviconURL: module.faviconURL || null
    }));

    console.log(`📊 Found ${modules.length} modules`);

    return new Response(JSON.stringify(formattedModules), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch modules',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Adds a new module to the database
// Expects an object with 'heading' and 'subHeading' properties
// Returns the inserted module's ID on success
async function addModule({ heading, subHeading, faviconURL }) {
  try {
    console.log('📥 Inserting new module...');

    const { createModule } = await import("@db/db.js");

    // Create new module in Firestore
    const result = await createModule({ heading, subheading: subHeading, faviconURL});

    console.log(`✅ Inserted with ID: ${result.moduleId}`);

    return {
      success: true,
      id: result.moduleId,
    };
  } catch (error) {
    console.error('❌ Insert failed:', error);
    throw error;
  }
}

// Deletes a module and its related data (submissions, knowledge checks, content)
// Expects a module ID as input
// Uses Firestore batch operations to ensure data consistency
async function deleteModule(id) {
  try {
    console.log(`🗑️ Starting deletion for module ID: ${id}`);

    // This function handles deletion of module and all related data
    await (await import("@db/db.js")).deleteModule(id);

    console.log(`✅ Module ${id} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Module deletion failed: ${error.message}`);
    throw error;
  }
}

// Updates an existing module's heading and subheading
// Expects an object with 'id', 'heading', and 'subHeading' properties
// Returns success status and module ID on success
async function updateModule({ id, heading, subHeading, faviconURL }) {
  try {
    const dbModule = await import("@db/db.js");

    await dbModule.updateModule(id, {
      heading,
      subheading: subHeading,
      faviconURL: faviconURL || null
    });

    return { success: true, id };
  } catch (error) {
    throw error;
  }
}

// Reorders modules based on admin's drag-and-drop arrangement
// Expects { order: [3, 1, 2] } where the array is moduleIds in the new order
async function reorderModulesHandler({ order }) {
  try {
    console.log('Reordering Modules...', order);

    const { reorderModules } = await import("@db/db.js");
    await reorderModules(order);

    console.log('Modules reordered successfully');
    return { success: true };
  } catch (error) {
    console.error('Reorder failed:', error.message);
    throw error;
  }
}

// GET handler: Retrieves all modules
// Calls the getModules function and returns its result
export async function GET() {
  try {
    return await getModules();
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler: Creates a new module
// Expects a JSON body with 'heading' and 'subHeading' fields
export async function POST(req) {
  try {
    const { heading, subHeading, faviconURL } = await req.json();

    if (!heading || !subHeading) {
      return new Response(JSON.stringify({ error: 'Missing heading or sub-heading' }), {
        status: 400,
      });
    }

    const result = await addModule({ heading, subHeading, faviconURL });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Route error:', error);
    return new Response(JSON.stringify({ error: 'Failed to add module' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE handler: Deletes a module by ID
// Expects a JSON body with an 'id' field
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing ID' }), {
        status: 400,
      });
    }

    const result = await deleteModule(id);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete module' }), {
      status: 500,
    });
  }
}

// PUT handler: Updates a module's heading and subheading
// Expects a JSON body with 'id', 'heading', and 'subHeading' fields
export async function PUT(req) {
  try {
    const { id, heading, subHeading, faviconURL } = await req.json();

    // Validate all required fields
    if (!id || !heading || !subHeading) {
      return new Response(JSON.stringify({
        error: 'Missing module ID, heading, or sub-heading'
      }), { status: 400 });
    }

    const result = await updateModule({ id, heading, subHeading, faviconURL });
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message || 'Failed to update module'
    }), { status: 500 });
  }
}

// PATCH handler: Handles both reordering and publish toggling
// For reorder: expects { order: [3, 1, 2] }
// For publish: expects { id: "moduleId", published: true/false }
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { order, id, published } = body;

    // Handle reorder request
    if (order) {
      if (!Array.isArray(order) || order.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid order array' }), {
          status: 400,
        });
      }
      const result = await reorderModulesHandler({ order });
      return new Response(JSON.stringify(result), { status: 200 });
    }

    // Handle publish toggle request
    if (id !== undefined && published !== undefined) {
      const { updateModulePublished } = await import("@db/db.js");
      await updateModulePublished(id, published);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Neither reorder nor publish
    return new Response(JSON.stringify({ error: 'Invalid PATCH request' }), {
      status: 400,
    });

  } catch (error) {
    console.error('❌ PATCH route error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to process request'
    }), { status: 500 });
  }
}