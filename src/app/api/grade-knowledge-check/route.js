import { NextResponse } from 'next/server';
import { gradeOpenEndedAnswer } from '@/app/_lib/ai/ai-grading.js';
import { getKnowledgeCheck } from '@/app/_db/admin-db.js';
import { defineUserRoute, badRequestError, internalServerError } from '@/app/_lib/route';

// POST /api/grade-knowledge-check
export const POST = defineUserRoute(async (req) => {
  try {
    const { moduleID, knowledgeCheckId, userAnswer } = await req.json();
    if (!moduleID || !knowledgeCheckId) {
      return badRequestError('moduleID and knowledgeCheckId are required');
    }
    if (!userAnswer || !String(userAnswer).trim()) {
      return badRequestError('userAnswer is required');
    }

    const kc = await getKnowledgeCheck(knowledgeCheckId, moduleID);
    if (!kc) {
      return badRequestError('Knowledge check not found');
    }
    if (kc.type !== 'open-ended') {
      return badRequestError('Only open-ended knowledge checks can be AI-graded');
    }
    if (!kc.aiGradingEnabled) {
      return badRequestError('AI grading is disabled for this knowledge check');
    }

    const result = await gradeOpenEndedAnswer({
      scenario: kc.gradingContext || '',
      question: kc.question,
      rubric: kc.rubric,
      maxGrade: 3, // fixed for now; authoring surface added later
      userAnswer: String(userAnswer),
    });

    if (result.reasoning) {
      // Debug/audit trace; not surfaced to the participant.
      console.log('[ai-grading] reasoning', { moduleID, knowledgeCheckId, model: result.model, reasoning: result.reasoning });
    }

    return NextResponse.json({
      score: result.score,
      feedback: result.feedback,
      maxGrade: 3,
      model: result.model,
    });
  } catch (error) {
    console.error('grade-knowledge-check error:', error);
    return internalServerError('Grading failed. Please try again.');
  }
});