import { NextResponse } from 'next/server';
import { getUserById } from '@/app/_db/admin-db.js';
import {
  badRequestError,
  defineUserRoute,
  internalServerError,
  validateJsonBody,
} from '@/app/_lib/route';

export const POST = defineUserRoute(async (request, session) => {
  try {
    const { requestBody, validationError } = await validateJsonBody(request);
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
User ID: ${user.uid}

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
    return internalServerError('Failed to submit feedback');
  }
});
