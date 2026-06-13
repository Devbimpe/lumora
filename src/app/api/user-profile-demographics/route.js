import { getUserById, updateUser } from "@/app/_db/admin-db.js";
import {
  defineUserRoute,
  verifyOwnership,
} from "@/app/_lib/route";

// GET method – returns existing demographic data for the user
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

    return new Response(
      JSON.stringify({
        user: { demographics: user.demographics || {} },
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

// POST method – updates demographic data for the user
export const POST = defineUserRoute(async (request, session) => {
  try {
    const body = await request.json();
    const { userId, age, location, jobStatus, jobTitle, education } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!verifyOwnership(session, userId)) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

    await updateUser(userId, {
      demographics: {
        age: age || "",
        location: location || "",
        jobStatus: jobStatus || "",
        jobTitle: jobTitle || "",
        education: education || "",
      },
    });

    return new Response(JSON.stringify({ message: "Saved successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
