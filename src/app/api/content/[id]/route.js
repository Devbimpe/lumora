// This is the code for edit the content 
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

async function getDbConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
  return connection;
}
// PUT handler: Updates content for a specific ContentID
// Expects a JSON body with 'Overview' and 'Reading' fields, and a ContentID from route parameters
export async function PUT(req, context) {
  const { Overview, Reading } = await req.json();
  const params = await context.params;
  const id = params.id;
  const connection = await getDbConnection();
  try {
     // Execute query to update the Overview and Reading fields for the specified ContentID
    await connection.execute(
      'UPDATE Content SET Overview = ?, Reading = ? WHERE ContentID = ?',
      [Overview, Reading, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await connection.end();
  }
}
// GET handler: Retrieves all modules with their ModuleID, Heading, and Subheading
export async function GET() {
  const connection = await getDbConnection();
  try {
     // Execute query to fetch ModuleID, Heading, and Subheading from the Modules table
    const [rows] = await connection.query('SELECT ModuleID, Heading, Subheading FROM Modules');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await connection.end();
  }
}