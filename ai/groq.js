import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function main(question, userAnswer) {
  const chatCompletion = await gradeKnowledgeCheck(question, userAnswer);
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function gradeKnowledgeCheck(question, userAnswer) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Grade the following knowledge check. Question: "${question}". User's answer: "${userAnswer}". Reply with a % grade and a brief explanation/feedback in this exact JSON format: {"Grade": ..., "Feedback": "..."}`
      },
    ],
    model: "llama-3.1-8b-instant",
  });
}
