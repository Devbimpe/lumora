import { NextResponse } from "next/server";
import {
  getKnowledgeChecksByModuleId,
  createKnowledgeCheck,
  deleteKnowledgeCheck,
  updateKnowledgeCheck,
} from "@/app/_db/admin-db.js";

/**
 * GET handler: Retrieves knowledge checks for a module
 * Requires moduleId query parameter
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const moduleId = url.searchParams.get("moduleId");

    if (!moduleId) {
      return NextResponse.json(
        { error: "moduleId query parameter is required" },
        { status: 400 },
      );
    }

    console.log("Fetching knowledge checks for moduleId:", moduleId);
    const knowledgeChecks = await getKnowledgeChecksByModuleId(moduleId);
    console.log(
      `Found ${knowledgeChecks.length} knowledge checks for module ${moduleId}`,
    );

    return NextResponse.json(knowledgeChecks, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API GET error:", error);
    console.error("Error details:", error.message, error.stack);
    return NextResponse.json(
      {
        error: "Failed to fetch knowledge checks",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
/**
 * POST handler: Creates a new knowledge check
 * Supports both multiple-choice and descriptive question types.
 * For descriptive questions, choices and answer can be empty.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      moduleID,
      contentId,
      question,
      choices,
      answer,
      explain,
      allowance,
    } = body;

    // only moduleID and question are required — descriptive questions
    // won't have choices or a correct answer
    if (!moduleID || !question) {
      return NextResponse.json(
        { error: "moduleID and question are required" },
        { status: 400 },
      );
    }

    // default to empty choices/answer for descriptive questions
    const result = await createKnowledgeCheck({
      moduleID,
      contentId,
      question,
      choices: choices || [],
      answer: answer || "",
      explain,
      allowance,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("API POST error:", error);
    return NextResponse.json(
      { error: "Failed to create knowledge check", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * DELETE handler: Deletes a knowledge check
 * Expects a JSON body with 'knowledgeCheckId' and 'moduleID' fields
 */
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { knowledgeCheckId, moduleID } = body;

    if (!knowledgeCheckId || !moduleID) {
      return NextResponse.json(
        { error: "knowledgeCheckId and moduleID are required" },
        { status: 400 },
      );
    }

    await deleteKnowledgeCheck(knowledgeCheckId, moduleID);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete knowledge check", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * PUT handler: Updates a knowledge check
 * Expects a JSON body with 'knowledgeCheckId', 'moduleID', 'question', 'choices', 'answer', and 'explain' fields
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { knowledgeCheckId, moduleID, question, choices, answer, explain } =
      body;

    if (!knowledgeCheckId || !moduleID) {
      return NextResponse.json(
        { error: "knowledgeCheckId and moduleID are required" },
        { status: 400 },
      );
    }

    await updateKnowledgeCheck(knowledgeCheckId, moduleID, {
      question,
      choices,
      answer,
      explain: explain || "",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update knowledge check", details: error.message },
      { status: 500 },
    );
  }
}
