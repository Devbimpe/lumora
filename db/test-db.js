// This code is just for testing the database connection
// and should not be used in production.
import 'dotenv/config';
import pool, { testConnection } from './db.js';

(async () => {
    try {
        await testConnection();
        // Query and print something from the database, e.g., list all users
        const [rows] = await pool.query('SELECT * FROM users LIMIT 5');
        console.log('Sample users:', rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
})();