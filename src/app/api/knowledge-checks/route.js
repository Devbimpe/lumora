import { NextResponse } from "next/server";
import {
  getKnowledgeChecksByModuleId,
  createKnowledgeCheck,
  deleteKnowledgeCheck,
  updateKnowledgeCheck,
} from "@/app/_db/admin-db.js";
import {
  defineAdminRoute,
  defineUserRoute,
  badRequestError,
  internalServerError,
  validateJsonBody,
} from "@/app/_lib/route";

function normalizeKcFields(type, { choices, correctAnswer, rubric, gradingContext, explanation, aiGradingEnabled } = {}) {
  if (type === "multiple-choice") {
    const filled = (choices || []).filter((c) => typeof c === "string" && c.trim());
    if (filled.length < 2) {
      return { error: "At least 2 non-empty choices are required for multiple-choice" };
    }
    const idx = Number(correctAnswer);
    if (!Number.isInteger(idx) || idx < 0 || idx >= filled.length) {
      return { error: "correctAnswer must be a valid choice index" };
    }
    return { fields: { choices: filled, correctAnswer: idx, explanation: explanation || '' } };
  }
  if (aiGradingEnabled && (!rubric || !String(rubric).trim())) {
    return { error: "rubric is required for AI-graded open-ended knowledge checks" };
  }
  if (!aiGradingEnabled && (!explanation || !String(explanation).trim())) {
    return { error: "explanation is required when AI grading is disabled" };
  }
  return { fields: { rubric: String(rubric || ''), gradingContext: gradingContext || '', aiGradingEnabled: !!aiGradingEnabled, explanation: explanation || '' } };
}

/**
 * GET handler: Retrieves knowledge checks for a module
 * Requires moduleId query parameter
 */
export const GET = defineUserRoute(async (request) => {
  try {
    const moduleId = request.nextUrl.searchParams.get("moduleId");
    if (!moduleId) {
      return badRequestError("moduleId query parameter is required");
    }

    const knowledgeChecks = await getKnowledgeChecksByModuleId(moduleId);
    return NextResponse.json(knowledgeChecks);
  } catch (error) {
    console.error("API GET error:", error);
    return internalServerError("Failed to fetch knowledge checks");
  }
});

/**
 * POST handler: Creates a new knowledge check.
 */
export const POST = defineAdminRoute(async (request) => {
  try {
    const { body, validationError } = await validateJsonBody(request);
    if (validationError) return validationError;

    const { moduleID, contentId, sectionId, type, question, ...rest } = body;
    if (!moduleID || !question) {
      return badRequestError("moduleID and question are required");
    }
    if (type !== "multiple-choice" && type !== "open-ended") {
      return badRequestError("type must be 'multiple-choice' or 'open-ended'");
    }

    const result = normalizeKcFields(type, rest);
    if (result.error) return badRequestError(result.error);

    const created = await createKnowledgeCheck({
      moduleID,
      contentId,
      sectionId,
      type,
      question,
      ...result.fields,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("API POST error:", error);
    return internalServerError("Failed to create knowledge check");
  }
});

/**
 * DELETE handler: Deletes a knowledge check
 * Expects a JSON body with 'knowledgeCheckId' and 'moduleID' fields
 */
export const DELETE = defineAdminRoute(async (request) => {
  try {
    const { body, validationError } = await validateJsonBody(request);
    if (validationError) return validationError;

    const { knowledgeCheckId, moduleID } = body;
    if (!knowledgeCheckId || !moduleID) {
      return badRequestError("knowledgeCheckId and moduleID are required");
    }

    await deleteKnowledgeCheck(knowledgeCheckId, moduleID);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API DELETE error:", error);
    return internalServerError("Failed to delete knowledge check");
  }
});

/**
 * PUT handler: Updates a knowledge check.
 */
export const PUT = defineAdminRoute(async (request) => {
  try {
    const { body, validationError } = await validateJsonBody(request);
    if (validationError) return validationError;

    const { knowledgeCheckId, moduleID, contentId, sectionId, type, question, ...rest } = body;
    if (!knowledgeCheckId || !moduleID) {
      return badRequestError("knowledgeCheckId and moduleID are required");
    }
    if (type !== "multiple-choice" && type !== "open-ended") {
      return badRequestError("type must be 'multiple-choice' or 'open-ended'");
    }
    if (!question) {
      return badRequestError("question is required");
    }

    const result = normalizeKcFields(type, rest);
    if (result.error) return badRequestError(result.error);

    await updateKnowledgeCheck(knowledgeCheckId, moduleID, {
      contentId,
      sectionId,
      type,
      question,
      ...result.fields,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API PUT error:", error);
    return internalServerError("Failed to update knowledge check");
  }
});