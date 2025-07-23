import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // TO DO if the conneciton limit need to be increased
    queueLimit: 0,
});



export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('Database connection successful!');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
}

export async function getModuleContent(moduleId) {
    const [rows] = await pool.query(
    'SELECT * FROM modulecontent WHERE module_id = ? ORDER BY section_order',
    [moduleId]
    );
    return rows;
    }
export default pool;

