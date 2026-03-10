import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function main(question, userAnswer, sampleAnswer = '', explanation = '') {
  const chatCompletion = await gradeKnowledgeCheck(question, userAnswer, sampleAnswer, explanation);
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function gradeKnowledgeCheck(question, userAnswer, sampleAnswer = '', explanation = '') {
  const parts = [
    `Question: "${question}"`,
    `User's answer: "${userAnswer}"`,
  ];
  if (sampleAnswer) parts.push(`Sample or expected answer (for grading reference): "${sampleAnswer}"`);
  if (explanation) parts.push(`Additional context or notes for grading: "${explanation}"`);
  const content = `Grade the following knowledge check. ${parts.join('. ')} Reply with a % grade and a brief explanation/feedback in this exact JSON format: {"Grade": ..., "Feedback": "..."}`;

  return groq.chat.completions.create({
    messages: [{ role: "user", content }],
    model: "llama-3.1-8b-instant",
  });
}
