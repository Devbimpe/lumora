import { getUserById, updateUser } from "@db/admin-db.js";
import { SecurityHelper } from "@/src/app/lib/enforce-security.js";

// GET method
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
    
        if (!userId) {
            return new Response(JSON.stringify({ error: "Missing userId" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const session = await SecurityHelper.verifyOwnership(request, userId);
        if (!session.valid) return new Response(JSON.stringify({ error: session.error }), { status: 403 });
    
        const user = await getUserById(userId);
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }
    
        return new Response(
            JSON.stringify({ user: { portfolio: user.portfolio || {} }}),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

// POST method
export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, linkedIn, github, website } = body;
    
        if (!userId) {
            return new Response(JSON.stringify({ error: "Missing userId" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const session = await SecurityHelper.verifyOwnership(request, userId);
        if (!session.valid) return new Response(JSON.stringify({ error: session.error }), { status: 403 });
    
        await updateUser(userId, {
            portfolio: {
            linkedIn: linkedIn || "",
            github: github || "",
            website: website || ""
            }
        });
    
        return new Response(
            JSON.stringify({ message: "Saved successfully" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
