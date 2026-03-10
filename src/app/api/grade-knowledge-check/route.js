import { NextResponse } from 'next/server';
import { gradeKnowledgeCheck } from '@/ai/groq.js';

// POST /api/grade-knowledge-check — body: { "question": "...", "userAnswer": "..." }
export async function POST(req) {
  try {
    const { question, userAnswer } = await req.json();
    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing question or userAnswer' },
        { status: 400 }
      );
    }
    const completion = await gradeKnowledgeCheck(question, userAnswer);
    let text = (completion.choices[0]?.message?.content ?? '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    // Parse LLM response as JSON (expected: {"Grade": ..., "Feedback": "..."})
    let grade, feedback;
    try {
      const parsed = JSON.parse(text);
      grade = parsed.Grade;
      feedback = parsed.Feedback;
    } catch {
      grade = null;
      feedback = text;
    }
    return NextResponse.json({ Grade: grade, Feedback: feedback });
  } catch (error) {
    console.error('grade-knowledge-check error:', error);
    return NextResponse.json(
      { error: error.message || 'Groq request failed' },
      { status: 500 }
    );
  }
}


