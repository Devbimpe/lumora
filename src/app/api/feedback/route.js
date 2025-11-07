import { NextResponse } from 'next/server';
import { createFeedback } from '@db/db.js';
import { getUserByFirebaseUid } from '@db/db.js';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    // Get the auth token from cookies
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Extract the auth-token from cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    const token = cookies['auth-token'];
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user data from Firestore
    const user = await getUserByFirebaseUid(decoded.firebaseUid || decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get feedback data from request body
    const { message, type } = await request.json();

    // Validate input
    if (!message || !type) {
      return NextResponse.json(
        { success: false, message: 'Message and type are required' },
        { status: 400 }
      );
    }

    // Create feedback entry
    const feedbackId = await createFeedback({
      userId: user.id,
      message: message.trim(),
      type: type // 'general' or module ID
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedbackId
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

