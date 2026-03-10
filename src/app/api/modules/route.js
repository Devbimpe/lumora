// This is the code to display the content in the admin/module-management
import { NextResponse } from 'next/server';
import { getAllModules } from '@db/db.js';

// Get the module ID, Heading and Subheading from the Modules table
export async function GET() {
  try {
    const modules = await getAllModules();
    // Transform to match expected format
    const formattedModules = modules.map(module => ({
      ModuleID: module.moduleId,
      Heading: module.heading,
      Subheading: module.subheading,
      published: module.published ?? false,
      faviconURL: module.faviconURL ?? null,
    }));
    return NextResponse.json(formattedModules);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}