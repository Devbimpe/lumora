import mysql from 'mysql2/promise';

// Export a function that can be imported by the bridge
export async function getModules() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Database connected');
    
    const [modules] = await connection.query(`
      SELECT ModuleID AS id, title
      FROM modules
    `);
    
    console.log(`📊 Found ${modules.length} modules`);
    
    await connection.end();
    
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