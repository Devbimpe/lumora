import { sendEmailVerification } from "@/app/api/(user)/email-verification";
import { defineUnverifiedUserRoute } from "@/app/_lib/route";
import { NextResponse } from "next/server";

export const POST = defineUnverifiedUserRoute(async (req, session) => {
  if (!session.claim.email || session.claim.email_verified) {
    return NextResponse.json({ status: 'verified' });
  }

  // Don't resend if the current token is still valid
  if (session.doc.activationToken && session.doc.activationTokenExpires.toDate() > new Date()) {
    return NextResponse.json({ status: 'valid_token' });
  }

  await sendEmailVerification(session.uid, session.doc.name, session.claim.email);
  return NextResponse.json({ status: 'sent' });
});
