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

  const content = `You are grading a short knowledge-check answer. Be fair and consistent.

${parts.join('\n')}

Grading rules:
- Grade primarily on whether the answer is CORRECT or captures the right idea. Do not heavily penalize uncertainty (e.g. "I think X") if X is correct—give full or high credit when the answer is right.
- Accept equivalent correct answers: same meaning in different forms. Examples: word numbers = digits ("five" = 5, "four" = 4); different wording for the same fact; capitalization or spelling variants. Give high marks (e.g. 90–100%) and optionally give brief feedback on format.
- If the question asks for "one" or "an example" and the user gives several correct answers, that satisfies the question—give full or near-full credit, not partial for "giving too many."
- Use the sample answer only as a rubric for key points when provided; partial credit for hitting some points, high credit for main idea correct.
- When "explanation" or "notes for grading" explicitly state what is sufficient for full credit (e.g. "X alone is sufficient for full credit"), follow that and award full or near-full credit when the user meets it.
- Give 0-30% only when the answer is wrong, irrelevant, or shows no understanding. Give 70-100% when the answer is correct or mostly correct.
- Reply with ONLY valid JSON in this exact format (no markdown, no extra text): {"Grade": <number 0-100>, "Feedback": "<brief constructive feedback>"}
- Grade must be a single number (integer), e.g. 85, not "85" or 85.0.`;

  return groq.chat.completions.create({
    messages: [{ role: "user", content }],
    model: "llama-3.1-8b-instant",
  });
}
