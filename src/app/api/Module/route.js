import pool from '@db/db.js';

// GET handler: Retrieves module details, associated content, and knowledge checks
// Supports optional filtering by moduleId via query parameter
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const moduleId = url.searchParams.get('moduleId');

    let query = `
        SELECT
        Modules.ModuleID,
        Modules.Heading,
        Modules.Subheading,
        Content.ContentID,
        Content.Overview,
        Content.Reading,
        KnowledgeChecks.Question,
        KnowledgeChecks.Answer
      FROM Modules
      JOIN Content ON Modules.ModuleID = Content.ModuleID
      LEFT JOIN KnowledgeChecks ON Content.ContentID = KnowledgeChecks.ContentID
    `;

    const params = [];
    // If moduleId is provided, add a WHERE clause to filter by ModuleID
    if (moduleId) {
      query += ' WHERE Modules.ModuleID = ?';
      params.push(moduleId);
    }

    query += ' ORDER BY Content.ContentID ASC';
    // Execute the query with the provided parameters
    const [rows] = await pool.query(query, params);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch module content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
