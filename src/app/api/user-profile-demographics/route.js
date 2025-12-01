import { getUserById, updateUser } from "@db/db.js";

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
    
        const user = await getUserById(userId);
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), 
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        return new Response(
            JSON.stringify({ user: { demographics: user.demographics || {}, }}),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    }catch (error){
        return new Response(JSON.stringify({ error: error.message }), 
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}

// POST method
export async function POST(request) {
    try{
        const body = await request.json();
        const { userId, age, location, jobStatus, jobTitle, education } = body;

        if (!userId) {
            return new Response(JSON.stringify({ error: "Missing userId" }), 
                {
                status: 400,
                headers: { "Content-Type": "application/json" }
                }
            );
        }
        await updateUser(userId, {
            demographics: {
                age: age || "",
                location: location || "",
                jobStatus: jobStatus || "",
                jobTitle: jobTitle || "",
                education: education || "",
            }
        });

        return new Response(
            JSON.stringify({ message: "Saved successfully" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );

        
    }catch (error){
        return new Response(JSON.stringify({ error: error.message }), 
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}