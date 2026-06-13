import {
  badRequestError,
  definePublicRoute,
  validateJsonBody,
} from '@/app/_lib/route';
import { createUserAccount, createUserDoc } from '@/app/_db/admin-db';
import { mapAuthError, serverAuthErrorMap } from '@/app/_lib/auth-errors';
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
      email,
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
    const message = mapAuthError(err, serverAuthErrorMap);

    // Known auth validation errors -> 400
    if (err.code && err.code in serverAuthErrorMap) {
      return badRequestError(message);
    }

    // Unknown errors -> 500
    console.warn('Signup error:', err);
    return Response.json({ error: message }, { status: 500 });
  }
});
