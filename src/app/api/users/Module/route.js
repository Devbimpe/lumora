import pool from '../../../../../db/db.js';

export async function GET(request) {
    try {
    const [rows] = await pool.query('SELECT * FROM modulecontent ORDER BY section_order ASC');
    return new Response(JSON.stringify(rows), {
        status: 200,
        headers: {
        'Content-Type': 'application/json'
        }
    });
    } catch (error) {
    console.error('API GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch module content' }), {
        status: 500,
        headers: {
        'Content-Type': 'application/json'
        }
    });
    }
}
