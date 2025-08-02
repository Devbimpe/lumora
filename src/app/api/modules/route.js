// This is the code to display the content in the admin/module-management
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
// Get the module ID, Heading and Subheading from the Modules table
export async function GET() {
  const connection = await getDbConnection();
  try {
    const [rows] = await connection.query('SELECT ModuleID, Heading, Subheading FROM Modules');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await connection.end();
  }
}