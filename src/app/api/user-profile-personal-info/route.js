import { getUserById, updateUser } from "@/app/_db/admin-db.js";
import {
  defineUserRoute,
  verifyOwnership,
} from "@/app/lib/route";

// GET — return personalInfo ONLY
export const GET = defineUserRoute(async (request, session) => {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!verifyOwnership(session, userId)) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

    const user = await getUserById(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ensure personalInfo always exists
    const personalInfo = user.personalInfo || {};

    return new Response(
      JSON.stringify({
        user: {
          // Root-level fields (name and username)
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          // Personal info fields
          personalInfo: {
            fullName: personalInfo.fullName || "",
            userName: user.username || "",
            email: user.email || "",
            pronouns: personalInfo.pronouns || "",
            headline: personalInfo.headline || "",
            bio: personalInfo.bio || "",
          },
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// POST — save everything INSIDE personalInfo
export const POST = defineUserRoute(async (request, session) => {
  try {
    const body = await request.json();
    const { userId, fullName, userName, email, pronouns, headline, bio } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!verifyOwnership(session, userId)) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

    // Save root-level fields AND personalInfo
    // Changing username and email is not supported for now
    await updateUser(userId, {
        name: fullName || "",
        // username: userName || "",
        // email: email || "",
        personalInfo: {
            fullName,
            // userName,
            // email,
            pronouns,        
            headline,        
            bio,             
        },
    });


    return new Response(
      JSON.stringify({ message: "Saved successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
