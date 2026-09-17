// Database configuration and connection manager
// Supports PostgreSQL connection pooling and atomic transactions

require("dotenv").config();
const { Pool } = require("pg");

const poolConfig = {
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT, 10) || 5432,
  database: process.env.PGDATABASE || "e_outpass_db",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
};

const pool = new Pool(poolConfig);

let isConnected = false;

pool.on("error", (err) => {
  console.warn("[PostgreSQL Pool Error]:", err.message);
});

/**
 * Execute a single query against the pool
 */
async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Acquire a dedicated client for transactions
 */
async function getClient() {
  return pool.connect();
}

/**
 * Execute a callback within an ACID database transaction
 * @param {Function} callback - async (client) => result
 */
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Verifies connectivity with PostgreSQL
 */
async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW() as now, version() as version;");
    isConnected = true;
    console.log(`[PostgreSQL] Connected to ${poolConfig.database} at ${poolConfig.host}:${poolConfig.port}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`[PostgreSQL Notice] Could not connect to database "${poolConfig.database}": ${err.message}`);
    console.warn(`[PostgreSQL Notice] Follow the instructions in DATABASE_SETUP_GUIDE.md to create the database in pgAdmin.`);
    return false;
  }
}

module.exports = {
  pool,
  query,
  getClient,
  withTransaction,
  testConnection,
  isPostgresConnected: () => isConnected,
  poolConfig
};
