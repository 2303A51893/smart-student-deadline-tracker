/**
 * Database Module
 * Manages PostgreSQL connection pool, schema initialization, and test fallbacks.
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
let isMemoryStore = false;

// In-memory test store used when USE_TEST_MEMORY_DB=true or in isolated test runs without live DB
class MemoryDatabase {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  reset() {
    this.tasks = [];
    this.nextId = 1;
  }

  async query(text, params = []) {
    const trimmed = text.trim();

    // 1. SELECT 1 (Health check)
    if (/^SELECT\s+1/i.test(trimmed)) {
      return { rows: [{ '?column?': 1 }], rowCount: 1 };
    }

    // 2. CREATE TABLE / INDEX (No-op in memory)
    if (/^CREATE\s+(TABLE|INDEX)/i.test(trimmed)) {
      return { rows: [], rowCount: 0 };
    }

    // 3. INSERT INTO tasks
    if (/^INSERT\s+INTO\s+tasks/i.test(trimmed)) {
      const now = new Date().toISOString();
      const newTask = {
        id: this.nextId++,
        title: params[0],
        description: params[1] || null,
        category: params[2],
        priority: params[3] || 'Medium',
        due_date: typeof params[4] === 'string' ? params[4].slice(0, 10) : params[4],
        completed: Boolean(params[5] ?? false),
        created_at: now,
        updated_at: now,
      };
      this.tasks.push(newTask);
      return { rows: [{ ...newTask }], rowCount: 1 };
    }

    // 4. UPDATE tasks SET completed=$1 ... WHERE id=$2
    if (/UPDATE\s+tasks\s+SET\s+completed\s*=/i.test(trimmed)) {
      const completed = Boolean(params[0]);
      const id = parseInt(params[1], 10);
      const task = this.tasks.find((t) => t.id === id);
      if (!task) return { rows: [], rowCount: 0 };
      task.completed = completed;
      task.updated_at = new Date().toISOString();
      return { rows: [{ ...task }], rowCount: 1 };
    }

    // 5. UPDATE tasks (Full update)
    if (/^UPDATE\s+tasks\s+SET\s+title\s*=/i.test(trimmed)) {
      const id = parseInt(params[6], 10);
      const task = this.tasks.find((t) => t.id === id);
      if (!task) return { rows: [], rowCount: 0 };
      task.title = params[0];
      task.description = params[1] || null;
      task.category = params[2];
      task.priority = params[3];
      task.due_date = typeof params[4] === 'string' ? params[4].slice(0, 10) : params[4];
      task.completed = Boolean(params[5]);
      task.updated_at = new Date().toISOString();
      return { rows: [{ ...task }], rowCount: 1 };
    }

    // 6. DELETE FROM tasks WHERE id=$1
    if (/^DELETE\s+FROM\s+tasks\s+WHERE\s+id\s*=/i.test(trimmed)) {
      const id = parseInt(params[0], 10);
      const index = this.tasks.findIndex((t) => t.id === id);
      if (index === -1) return { rows: [], rowCount: 0 };
      const [removed] = this.tasks.splice(index, 1);
      return { rows: [{ ...removed }], rowCount: 1 };
    }

    // 7. SELECT * FROM tasks WHERE id = $1
    if (/^SELECT\s+\*\s+FROM\s+tasks\s+WHERE\s+id\s*=\s*\$1/i.test(trimmed)) {
      const id = parseInt(params[0], 10);
      const task = this.tasks.find((t) => t.id === id);
      return { rows: task ? [{ ...task }] : [], rowCount: task ? 1 : 0 };
    }

    // 8. General SELECT * FROM tasks (with filter and sort handling)
    if (/^SELECT/i.test(trimmed) && /FROM\s+tasks/i.test(trimmed)) {
      let filtered = this.tasks.map((t) => ({ ...t }));

      // Check search parameter
      if (trimmed.includes('title ILIKE') && params.length > 0) {
        const searchPattern = String(params[0]).replace(/%/g, '').toLowerCase();
        filtered = filtered.filter((t) => t.title.toLowerCase().includes(searchPattern));
      }

      // Check category
      const catMatch = trimmed.match(/category\s*=\s*\$(\d+)/i);
      if (catMatch) {
        const paramIndex = parseInt(catMatch[1], 10) - 1;
        filtered = filtered.filter((t) => t.category === params[paramIndex]);
      }

      // Check priority
      const prioMatch = trimmed.match(/priority\s*=\s*\$(\d+)/i);
      if (prioMatch) {
        const paramIndex = parseInt(prioMatch[1], 10) - 1;
        filtered = filtered.filter((t) => t.priority === params[paramIndex]);
      }

      // Check completed
      const compMatch = trimmed.match(/completed\s*=\s*\$(\d+)/i);
      if (compMatch) {
        const paramIndex = parseInt(compMatch[1], 10) - 1;
        filtered = filtered.filter((t) => t.completed === Boolean(params[paramIndex]));
      }

      // Default sorting: due_date ASC
      filtered.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

      return { rows: filtered, rowCount: filtered.length };
    }

    return { rows: [], rowCount: 0 };
  }
}

const memoryDb = new MemoryDatabase();

/**
 * Creates or retrieves the pg Pool instance
 */
function getPool() {
  if (process.env.USE_TEST_MEMORY_DB === 'true') {
    isMemoryStore = true;
    return null;
  }

  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  // Determine SSL requirement (Neon, Render, Supabase require SSL)
  let sslConfig = false;
  if (connectionString) {
    const isRemote =
      connectionString.includes('neon.tech') ||
      connectionString.includes('render.com') ||
      connectionString.includes('sslmode=require') ||
      connectionString.includes('compute.amazonaws.com');
    if (isRemote || process.env.PGSSLMODE === 'require') {
      sslConfig = { rejectUnauthorized: false };
    }
  }

  try {
    if (connectionString) {
      pool = new Pool({
        connectionString,
        ssl: sslConfig,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    } else {
      pool = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'deadlinewise',
        ssl: sslConfig,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });

    return pool;
  } catch (err) {
    console.warn('[PostgreSQL Initialization Warning]:', err.message);
    isMemoryStore = true;
    return null;
  }
}

/**
 * Executes a SQL query with parameters
 * @param {string} text
 * @param {Array} params
 * @returns {Promise<{ rows: Array, rowCount: number }>}
 */
async function query(text, params = []) {
  if (process.env.USE_TEST_MEMORY_DB === 'true' || isMemoryStore) {
    return memoryDb.query(text, params);
  }

  const p = getPool();
  if (!p) {
    return memoryDb.query(text, params);
  }

  try {
    return await p.query(text, params);
  } catch (err) {
    // If running in test environment and Postgres is not reachable, gracefully fallback to memoryDb
    if (process.env.NODE_ENV === 'test') {
      console.warn('[DB Query fallback to in-memory store for testing]:', err.message);
      isMemoryStore = true;
      return memoryDb.query(text, params);
    }
    throw err;
  }
}

/**
 * Initializes the database schema safely (idempotent, no data loss)
 */
async function initDb() {
  if (process.env.USE_TEST_MEMORY_DB === 'true') {
    return { success: true, message: 'Test memory database ready.' };
  }

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await query(schemaSql);
    return { success: true, message: 'PostgreSQL schema initialized successfully.' };
  } catch (err) {
    console.warn('[DB Init Warning]: Could not run schema migration against PostgreSQL:', err.message);
    if (process.env.NODE_ENV === 'test') {
      isMemoryStore = true;
      return { success: true, message: 'Falling back to in-memory store for testing.' };
    }
    return { success: false, error: err.message };
  }
}

/**
 * Checks database health status
 * @returns {Promise<{ connected: boolean, provider: string, message: string }>}
 */
async function checkDbHealth() {
  if (process.env.USE_TEST_MEMORY_DB === 'true' || isMemoryStore) {
    return {
      connected: true,
      provider: 'In-Memory (Test/Isolated)',
      message: 'Running isolated test memory database.',
    };
  }

  const p = getPool();
  if (!p) {
    return {
      connected: false,
      provider: 'PostgreSQL',
      message: 'Database pool not configured or unavailable.',
    };
  }

  try {
    const res = await p.query('SELECT 1 AS health_check');
    const isHealthy = res.rows && res.rows[0]?.health_check === 1;
    return {
      connected: isHealthy,
      provider: process.env.DATABASE_URL?.includes('neon') ? 'Neon PostgreSQL' : 'PostgreSQL',
      message: isHealthy ? 'Database is healthy and reachable.' : 'Database query returned unexpected result.',
    };
  } catch (err) {
    return {
      connected: false,
      provider: 'PostgreSQL',
      message: `Database connection failed: ${err.message}`,
    };
  }
}

/**
 * Closes the database pool
 */
async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  query,
  initDb,
  checkDbHealth,
  getPool,
  close,
  memoryDb,
};
