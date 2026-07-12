import { NextResponse } from 'next/server';
import { createFeedback, getUserById } from '@/app/_db/admin-db.js';
import {
  badRequestError,
  defineUserRoute,
  internalServerError,
  validateJsonBody,
} from '@/app/_lib/route';

export const POST = defineUserRoute(async (request, session) => {
  try {
    const { body: requestBody, validationError } = await validateJsonBody(request);
    if (validationError) return validationError;

    const { message, type } = requestBody;

    // Validate input
    if (!message || !type) {
      return badRequestError('Message and type are required');
    }

    const user = await getUserById(session.uid);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const feedbackId = await createFeedback({
      userId: session.uid,
      message: message.trim(),
      type,
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId,
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return internalServerError('Failed to submit feedback');
  }
});