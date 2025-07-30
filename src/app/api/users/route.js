// Smaple code for the API route to fetch users from the database:
// TODO: This is a demo function for the backend. This should be removed once other backend functions get added to /src/app/api'
import pool from '@db/db.js';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT UserID FROM users LIMIT 2');
    console.log(rows); // Log the rows to the console for debugging
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
