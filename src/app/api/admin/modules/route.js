import { NextResponse } from 'next/server';
import { getModules } from '@admin-root/api/modules/route';
import { addModule } from '@admin-root/api/modules/route'; // adjust path if needed
import { deleteModule } from '@admin-root/api/modules/route';
import { updateModule } from '@admin-root/api/modules/route';

// GET handler: Retrieves all modules
// Calls the getModules function from the bridge and returns its result
export async function GET() {
  try {
    return await getModules();
  } catch (error) {
    console.error('API bridge error:', error);
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
    const { heading, subHeading } = await req.json();

    if (!heading || !subHeading) {
      return new Response(JSON.stringify({ error: 'Missing heading or sub-heading' }), {
        status: 400,
      });
    }

    const result = await addModule({ heading, subHeading });

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

// DELETE handler: Deletes a user by ID
// Expects a JSON body with an 'id' field
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing ID' }), {
        status: 400,
      });
    }

    const result = await deleteModule(id); // use bridge function

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete module' }), {
      status: 500,
    });
  }
}
// PUT handler: Toggles a user's activation status
// Expects a JSON body with 'userId' and 'isActivated' fields
export async function PUT(req) {
  try {
    const { id, heading, subHeading } = await req.json();
    
    // Validate all required fields
    if (!id || !heading || !subHeading) {
      return new Response(JSON.stringify({ 
        error: 'Missing module ID, heading, or sub-heading' 
      }), { status: 400 });
    }

    const result = await updateModule({ id, heading, subHeading });
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to update module' 
    }), { status: 500 });
  }
}