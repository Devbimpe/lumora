// This is the code for edit the content 
import { NextResponse } from 'next/server';
import { updateContent, getAllModules } from '@db/db.js';

// PUT handler: Updates content for a specific ContentID
// Expects a JSON body with 'Overview' and 'Reading' fields, and a ContentID from route parameters
export async function PUT(req, context) {
  try {
    const { Overview, Reading } = await req.json();
    const params = await context.params;
    const id = params.id;
    
    // Update content in Firestore
    await updateContent(id, { Overview, Reading });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET handler: Retrieves all modules with their ModuleID, Heading, and Subheading
export async function GET() {
  try {
    const modules = await getAllModules();
    
    // Transform to match expected format
    const formattedModules = modules.map(module => ({
      ModuleID: module.moduleId,
      Heading: module.heading,
      Subheading: module.subheading
    }));
    
    return NextResponse.json(formattedModules);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}