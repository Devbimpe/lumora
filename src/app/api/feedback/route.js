import { NextResponse } from 'next/server';
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

    // Format feedback type for display
    const feedbackTypeDisplay = type === 'General' || type === 'general' 
      ? 'General Feedback' 
      : `Module ${type} Feedback`;

    // Create email body template with user information and feedback
    const emailBody = `Dear Lumora Team,

I am submitting the following feedback:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${user.name || 'N/A'}
Username: ${user.username || 'N/A'}
Email: ${user.email || 'N/A'}
User ID: ${user.id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEEDBACK DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: ${feedbackTypeDisplay}
Submitted: ${new Date().toLocaleString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${message.trim()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your attention to this feedback.

Best regards,
${user.name || user.username || 'User'}`;

    // Create mailto URL with proper encoding
    const subject = encodeURIComponent(`New Feedback: ${feedbackTypeDisplay}`);
    const body = encodeURIComponent(emailBody);
    const to = 'lumora460@gmail.com';
    const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;

    return NextResponse.json({
      success: true,
      message: 'Feedback ready to send',
      mailtoUrl: mailtoUrl
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

