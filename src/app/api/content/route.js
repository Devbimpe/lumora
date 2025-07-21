import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection function
async function getDbConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    
    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    const connection = await getDbConnection();
    
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM Content WHERE ModuleID = ? ORDER BY ContentId',
        [moduleId]
      );
      
      return NextResponse.json(rows);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch content from database',
      details: error.message 
    }, { status: 500 });
  }
}
