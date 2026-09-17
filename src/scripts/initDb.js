// Database initialization script
// Connects to PostgreSQL, executes schema.sql and seeds.sql automatically

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function initDatabase() {
  const dbName = process.env.PGDATABASE || "e_outpass_db";
  const user = process.env.PGUSER || "postgres";
  const password = process.env.PGPASSWORD || "postgres";
  const host = process.env.PGHOST || "localhost";
  const port = parseInt(process.env.PGPORT, 10) || 5432;

  console.log(`\n======================================================`);
  console.log(`  E-Outpass System: PostgreSQL Database Initializer    `);
  console.log(`  Target DB: ${dbName} at ${host}:${port}              `);
  console.log(`======================================================\n`);

  // Step 1: Connect to default 'postgres' database to create e_outpass_db if not exists
  const rootClient = new Client({
    user,
    password,
    host,
    port,
    database: "postgres"
  });

  try {
    await rootClient.connect();
    console.log("✔ Connected to PostgreSQL server");

    const checkDb = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [dbName]
    );

    if (checkDb.rowCount === 0) {
      console.log(`Creating database "${dbName}"...`);
      await rootClient.query(`CREATE DATABASE "${dbName}";`);
      console.log(`✔ Database "${dbName}" created successfully!`);
    } else {
      console.log(`✔ Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.warn(`[Note during DB creation check]: ${err.message}`);
  } finally {
    await rootClient.end().catch(() => {});
  }

  // Step 2: Connect directly to e_outpass_db and run schema.sql & seeds.sql
  const targetClient = new Client({
    user,
    password,
    host,
    port,
    database: dbName
  });

  try {
    await targetClient.connect();
    console.log(`✔ Connected to database "${dbName}"`);

    const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    console.log("Executing schema.sql (creating tables, constraints, indexes)...");
    await targetClient.query(schemaSql);
    console.log("✔ Tables created: users, outpass_requests, outpass_status_history");

    const seedsPath = path.join(__dirname, "..", "db", "seeds.sql");
    if (fs.existsSync(seedsPath)) {
      const seedsSql = fs.readFileSync(seedsPath, "utf-8");
      console.log("Executing seeds.sql (inserting initial warden and student data)...");
      await targetClient.query(seedsSql);
      console.log("✔ Initial seed data inserted successfully!");
    }

    console.log(`\n>>> DATABASE INITIALIZATION COMPLETED SUCCESSFULLY! <<<\n`);
  } catch (err) {
    console.error("\n✖ Database initialization failed:", err.message);
    console.error("Please verify PostgreSQL is running and check your password in .env file.");
    process.exitCode = 1;
  } finally {
    await targetClient.end().catch(() => {});
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
