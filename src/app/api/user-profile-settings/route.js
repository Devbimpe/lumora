import { getUserById, deleteUser as deleteUserFromDB } from "@/app/_db/admin-db.js";
import { SecurityHelper } from "@/app/lib/enforce-security.js";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";

const auth = getAuth(); // TODO: move to admin-db.js

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }

    const session = await SecurityHelper.verifyOwnership(req, userId);
    if (!session.valid) return new Response(JSON.stringify({ error: session.error }), { status: 403 });

    const user = await getUserById(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const firebaseUid = user.firebaseUid;
    if (!firebaseUid) {
      return new Response(JSON.stringify({ error: "Firebase UID not found" }), { status: 500 });
    }

    // Delete user Firestore
    await deleteUserFromDB(userId);

    // Delete user from Firebase Auth
    await auth.deleteUser(firebaseUid);

    const cookieStore = await cookies();
    cookieStore.delete("auth-token");

    return new Response(JSON.stringify({ message: "Account deleted successfully" }), { status: 200 });
  } catch (err) {
    console.error("Error deleting account:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
