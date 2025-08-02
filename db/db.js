import 'dotenv/config';
import mysql from 'mysql2/promise';
// Create a connection pool for MySQL database
// Uses environment variables for configuration to keep sensitive data secure
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  // TO DO: Evaluate if connectionLimit needs adjustment based on application load
    queueLimit: 0,
});


// Tests the database connection by acquiring a connection and pinging the server
// Logs success or failure and releases the connection
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
// Retrieves content for a specific module from the modulecontent table
// Expects a module ID as input
// Returns rows ordered by section_order
export async function getModuleContent(moduleId) {
    const [rows] = await pool.query(
    'SELECT * FROM modulecontent WHERE module_id = ? ORDER BY section_order',
    [moduleId]
    );
    return rows;
    }
    // Export the connection pool as the default export for use in other modules
export default pool;

