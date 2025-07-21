import pool from '../../../../db/db.js';

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

    if (moduleId) {
      query += ' WHERE Modules.ModuleID = ?';
      params.push(moduleId);
    }

    query += ' ORDER BY Content.ContentID ASC';

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
