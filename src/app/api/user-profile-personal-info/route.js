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
            JSON.stringify({ user: { personsalInfo: user.personsalInfo || {} }}),
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
        const { userId, fullName, userName, email, pronouns, headline, bio } = body;

        if (!userId) {
            return new Response(JSON.stringify({ error: "Missing userId" }), 
                {
                status: 400,
                headers: { "Content-Type": "application/json" }
                }
            );
        }
        await updateUser(userId, {
            personalInfo: {
                fullName: fullName || "",
                userName: userName || "",
                email: email || "",
                pronouns: pronouns || "",
                headline: headline || "",
                bio: bio || ""
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