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
export async function PUT(req, context) {
  const { Overview, Reading } = await req.json();
  const params = await context.params;
  const id = params.id;
  const connection = await getDbConnection();
  try {
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