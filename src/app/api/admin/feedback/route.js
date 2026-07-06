import { NextResponse } from 'next/server';
import { getAllFeedbackWithUsers } from '@/app/_db/admin-db.js';
import { defineAdminRoute, internalServerError } from '@/app/_lib/route';

export const GET = defineAdminRoute(async () => {
  try {
    const feedback = await getAllFeedbackWithUsers();

    return NextResponse.json({
      feedback,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return internalServerError('Failed to fetch feedback');
  }
});