// test-credentials.js
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: '127.0.0.1',
  user: 'root', // replace with actual username
  password: '123456', // replace with actual password
  database: 'lumora' // replace with actual database name
});

const [rows] = await connection.query('SELECT 1 + 1 AS solution');
console.log('Result:', rows[0].solution);
await connection.end();