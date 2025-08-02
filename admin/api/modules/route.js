// Import MySQL library for promise-based database operations
import mysql from 'mysql2/promise';
// Import database connection pool from custom configuration
import pool from "@db/db.js"
// Export a function that can be imported by the bridge
export async function getModules() {
  try {
    
    console.log('✅ Database connected');
    // Execute query to fetch all modules, selecting ModuleID as 'id' and Heading
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

// Adds a new module to the database
// Expects an object with 'heading' and 'subHeading' properties
// Returns the inserted module's ID on success
export async function addModule({ heading, subHeading }) {
  try {
    console.log('📥 Inserting new module...');
    
    // Insert new module into the database 
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

// Deletes a module and its related data (submissions, knowledge checks, content)
// Expects a module ID as input
// Uses a transaction to ensure data consistency
export async function deleteModule(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log(`🗑️ Starting deletion for module ID: ${id}`);

    // 1. Delete student submissions related to this module
    await connection.query(`
      DELETE ss
      FROM StudentSubmissions ss
      JOIN KnowledgeChecks kc ON ss.KnowledgeCheckID = kc.KnowledgeCheckID
      JOIN Content c ON kc.ContentID = c.ContentID
      WHERE c.ModuleID = ?
    `, [id]);
    console.log('✅ Deleted related student submissions');

    // 2. Delete knowledge checks related to this module
    await connection.query(`
      DELETE kc
      FROM KnowledgeChecks kc
      JOIN Content c ON kc.ContentID = c.ContentID
      WHERE c.ModuleID = ?
    `, [id]);
    console.log('✅ Deleted related knowledge checks');

    // 3. Delete content related to this module
    await connection.query(`
      DELETE FROM Content
      WHERE ModuleID = ?
    `, [id]);
    console.log('✅ Deleted related content');

    // 4. Finally delete the module itself
    const [result] = await connection.query(`
      DELETE FROM Modules
      WHERE ModuleID = ?
    `, [id]);

    if (result.affectedRows === 0) {
      throw new Error('Module not found');
    }
    console.log('✅ Deleted module');

    await connection.commit();
    console.log(` Module ${id} deleted successfully`);
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error(`❌ Module deletion failed: ${error.message}`);}

}
// Updates an existing module's heading and subheading
// Expects an object with 'id', 'heading', and 'subHeading' properties
// Returns success status and module ID on success
export async function updateModule({ id, heading, subHeading }) {
  try {
    const [result] = await pool.query(
      `UPDATE modules 
       SET Heading = ?, SubHeading = ?
       WHERE ModuleID = ?`,
      [heading, subHeading, id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Module not found');
    }
    
    return { success: true, id };
  } catch (error) {
    throw error;
  }
}