import mysql from 'mysql2/promise';
import pool from "../../../db/db.js"
// Export a function that can be imported by the bridge
export async function getModules() {
  try {
    

    console.log('✅ Database connected');
    
    const [modules] = await pool.query(`
      SELECT ModuleID AS id, Heading
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


export async function addModule({ heading, subHeading }) {
  try {
    console.log('📥 Inserting new module...');

    const [result] = await pool.query(
      `INSERT INTO modules (Heading, SubHeading) VALUES (?, ?)`,
      [heading, subHeading]
    );

    console.log(`✅ Inserted with ID: ${result.insertId}`);

    return {
      success: true,
      id: result.insertId,
    };
  } catch (error) {
    console.error('❌ Insert failed:', error);
    throw error;
  }
}


export async function deleteModule(id) {
  try {
    console.log(`🗑️ Deleting module with ID ${id}...`);

    const [result] = await pool.query('DELETE FROM modules WHERE ModuleID = ?', [id]);

    if (result.affectedRows === 0) {
      throw new Error('Module not found');
    }

    console.log('✅ Module deleted');
    return { success: true };
  } catch (error) {
    console.error('❌ Delete failed:', error);
    throw error;
  }
}