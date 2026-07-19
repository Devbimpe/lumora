import { NextResponse } from 'next/server';
import { gradeOpenEndedAnswer } from '@/app/_lib/ai/ai-grading.js';
import { getKnowledgeCheck } from '@/app/_db/admin-db.js';
import {
  defineUserRoute,
  badRequestError,
  internalServerError,
  validateJsonBody,
  extractClientIp,
} from '@/app/_lib/route';
import { verifyTurnstile } from '@/app/_lib/turnstile';

// POST /api/grade-knowledge-check
export const POST = defineUserRoute(async (req) => {
  try {
    const { body, validationError } = await validateJsonBody(req);
    if (validationError) return validationError;

    const { moduleID, knowledgeCheckId, userAnswer, token } = body;
    if (!token) {
      return badRequestError('challenge token is required');
    }
    if (!moduleID || !knowledgeCheckId) {
      return badRequestError('moduleID and knowledgeCheckId are required');
    }
    if (!userAnswer || !String(userAnswer).trim()) {
      return badRequestError('userAnswer is required');
    }
    const trimmedAnswer = String(userAnswer).trim();
    if (trimmedAnswer.length < 10){
      return badRequestError('Please write a more complete answer before submitting'); 
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

    if (!await verifyTurnstile(token, 'ai-grading', extractClientIp(req))) {
      return badRequestError('Security challenge failed, please try again');
    }

    const result = await gradeOpenEndedAnswer({
      scenario: kc.gradingContext || '',
      question: kc.question,
      rubric: kc.rubric,
      maxGrade: 3, // fixed for now; authoring surface added later
      userAnswer: trimmedAnswer,
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
