// Sample code for the API route to fetch users from the database:
// TODO: This is a demo function for the backend. This should be removed once other backend functions get added to /src/app/api'
import { getAllUsers } from '@/app/_db/admin-db.js';

export async function GET() {
  try {
    const users = await getAllUsers();
    const limitedUsers = users.slice(0, 2).map(user => ({ id: user.id }));
    console.log(limitedUsers); // Log the rows to the console for debugging
    return Response.json(limitedUsers);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
