import { NextResponse } from 'next/server';
import { deleteUser as _deleteUser, getAllUsers, getUserById, updateUserAccount } from "@/app/_db/admin-db.js";
import { defineAdminRoute } from '@/app/lib/route';

// Retrieves all users from the database
// Returns a JSON response with user data
async function getUsers() {
  try {
    console.log('✅ Database connected');

    const users = await Array.fromAsync(getAllUsers());

    // Transform to match expected format with SQL-style field names
    const formattedUsers = users.map(user => ({
      UserID: user.account.uid,
      Username: user.doc.username,
      Email: user.account.email,
      Role: user.doc.role,
      PercentModulesCompleted: user.doc.percentModulesCompleted || 0,
      isActivated: user.account.emailVerified,
    }));

    console.log(`📊 Found ${users.length} users`);

    return new Response(JSON.stringify(formattedUsers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch users',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Deletes a user and their related student submissions
// Expects a user ID as input
// Uses Firestore batch operations to ensure data consistency
async function deleteUser(userId) {
  try {
    console.log(`🗑️ Starting deletion for user ID: ${userId}`);

    // This function handles deletion of user and related submissions
    await _deleteUser(userId);

    console.log(`User ${userId} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error(`❌ User deletion failed: ${error.message}`);

    if (error.message.includes('not found')) {
      const newError = new Error('User not found');
      newError.statusCode = 404;
      throw newError;
    }

    throw error;
  }
}

// Toggles a user's activation status
// Expects a user ID and new activation status (boolean)
async function toggleUserActivation(userId, newStatus) {
  try {
    // Check if user exists
    const user = await getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update activation status
    await updateUserAccount(userId, { emailVerified: !!newStatus });

  } catch (error) {
    throw error;
  }
}

// GET handler: Retrieves all users
export const GET = defineAdminRoute(async (req) => {
  try {
    return await getUsers();
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE handler: Deletes a user by ID
// Expects a JSON body with an 'id' field
export const DELETE = defineAdminRoute(async (req) => {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing ID' }), {
        status: 400,
      });
    }

    const result = await deleteUser(id);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
      status: 500,
    });
  }
});

// PUT handler: Toggles a user's activation status
// Expects a JSON body with 'userId' and 'isActivated' fields
export const PUT = defineAdminRoute(async (req) => {
  try {
    const { userId, isActivated } = await req.json();

    if (!userId || isActivated === undefined) {
      return new Response(JSON.stringify({ error: 'Missing userId or isActivated' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call toggle function
    await toggleUserActivation(userId, isActivated);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Toggle activation error:', error);
    const status = error.statusCode || 500;
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
