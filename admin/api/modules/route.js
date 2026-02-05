// Import database functions from Firestore
import { getAllModules } from "@db/db.js"

// Export a function that can be imported by the bridge
export async function getModules() {
  try {
    console.log('✅ Database connected');
    
    // Fetch all modules from Firestore
    const modules = await getAllModules();
    
    // Transform to match expected format
    const formattedModules = modules.map(module => ({
      id: module.moduleId,
      Heading: module.heading,
      SubHeading: module.subHeading || ""
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
export async function addModule({ heading, subHeading }) {
  try {
    console.log('📥 Inserting new module...');
    
    const { createModule } = await import("@db/db.js");
    
    // Create new module in Firestore
    const result = await createModule({ heading, subheading: subHeading });

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
export async function deleteModule(id) {
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
export async function updateModule({ id, heading, subHeading }) {
  try {
    const dbModule = await import("@db/db.js");
    
    await dbModule.updateModule(id, { 
      heading, 
      subheading: subHeading 
    });
    
    return { success: true, id };
  } catch (error) {
    throw error;
  }
}