import { NextResponse } from 'next/server';
import { gradeKnowledgeCheck } from '@/ai/groq.js';

// POST /api/grade-knowledge-check — body: { "question", "userAnswer", "sampleAnswer?", "explanation?" }
export async function POST(req) {
  try {
    const { question, userAnswer, sampleAnswer, explanation } = await req.json();
    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing question or userAnswer' },
        { status: 400 }
      );
    }
    const completion = await gradeKnowledgeCheck(
      question,
      userAnswer,
      sampleAnswer ?? '',
      explanation ?? ''
    );
    let text = (completion.choices[0]?.message?.content ?? '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    // Parse LLM response as JSON (expected: {"Grade": ..., "Feedback": "..."})
    let grade, feedback;
    try {
      const parsed = JSON.parse(text);
      const raw = parsed.Grade;
      const num = raw != null ? Math.round(Number(raw)) : NaN;
      grade = Number.isNaN(num) || num < 0 || num > 100 ? null : num;
      feedback = parsed.Feedback;
    } catch {
      grade = null;
      feedback = text;
    }
    return NextResponse.json({ Grade: grade, Feedback: feedback });
  } catch (error) {
    console.error('grade-knowledge-check error:', error);
    const status = error?.status === 429 || error?.statusCode === 429 || /rate limit/i.test(error?.message ?? '')
      ? 429
      : 500;
    const message = status === 429
      ? 'Groq API rate limit exceeded. Wait a minute or check your plan at console.groq.com.'
      : (error.message || 'Groq request failed');
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}


