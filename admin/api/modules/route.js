import mysql from 'mysql2/promise';
import pool from "../../../db/db.js"
// Export a function that can be imported by the bridge
export async function getModules() {
  try {
    

    console.log('✅ Database connected');
    
    const [modules] = await pool.query(`
      SELECT ModuleID AS id, title
      FROM modules
    `);
    
    console.log(`📊 Found ${modules.length} modules`);
    
    return new Response(JSON.stringify(modules), {
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

// Export the GET handler as well for consistency
export async function GET() {
  return await getModules();
}