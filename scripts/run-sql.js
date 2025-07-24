require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const mysql = require("mysql2/promise");

async function runSQL() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  const sql = fs.readFileSync("db/LUMORA_db.sql", "utf8");
  await connection.query(sql);
  await connection.end();
  console.log("SQL script executed.");
}

runSQL().catch(console.log);