import {
  badRequestError,
  definePublicRoute,
  validateJsonBody,
} from '@/app/lib/route';
import { createUserAccount, createUserDoc } from '@/app/_db/admin-db';
import { sendEmailVerification } from '@/app/api/(user)/email-verification';

// POST handler: Handles user signup
// Expects a JSON body with 'name', 'username', 'email', and 'password' fields
export const POST = definePublicRoute(async (req) => {
  try {
    const { body, validationError } = await validateJsonBody(req);
    if (validationError) return validationError;
    let { name, username, email, password } = body;

    name = name.trim();
    username = username.trim();
    email = email.trim();

    if (!name || !username || !email || !password)
      return badRequestError('Missing required sign up fields');

    // Create Firestore document for the user
    const { uid, error: docError } = await createUserDoc({
      name,
      username,
      role: 'Student',
    });

    if (docError) {
      return Response.json({ error: docError }, { status: 400 });
    }

    // Create Firebase Auth user with the same uid
    const userRecord = await createUserAccount({
      uid,
      email,
      password,
      displayName: name,
    });

    // Send the first verification email
    await sendEmailVerification(uid, name, email);

    // Return successful response with instructions for the user
    return Response.json(
      {
        uid: userRecord.uid,
        message:
          'Check your email — we’ve sent you an activation link to complete your registration.',
      },
      { status: 200 },
    );
  } catch (err) {
    // TODO: rework error code mapping
    // Pass user-friendly Firebase Auth errors to the frontend (Admin SDK error codes)
    if (
      err.code === 'auth/email-already-exists' ||
      err.code === 'auth/email-already-in-use'
    ) {
      return badRequestError('This email address is already registered.');
    }
    if (err.code === 'auth/invalid-password') {
      return badRequestError('Password does not meet requirements.');
    }
    if (err.code === 'auth/invalid-email') {
      return badRequestError('Please enter a valid email address.');
    }

    // Log any unhandled errors
    console.warn('Signup error:', err);

    // Return the specific error message to the client (to avoid swallowing useful errors)
    const errorMessage = err.message || 'Server error.';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
});
