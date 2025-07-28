import { NextResponse } from 'next/server';
import { getUsers } from '@admin-root/api/users/route';

export async function GET() {
  try {
    return await getUsers();
  } catch (error) {
    console.error('API bridge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { deleteUser } from '@admin-root/api/users/route';

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing ID' }), {
        status: 400,
      });
    }

    const result = await deleteUser(id); // use bridge function

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
      status: 500,
    });
  }
}

import { toggleUserActivation } from '@admin-root/api/users/route';
export async function PUT(req) {
  try {
    const { userId, isActivated } = await req.json();

    if (!userId || isActivated === undefined) {
      return new Response(JSON.stringify({ error: 'Missing userId or isActivated' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call your toggle function
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
}