/**
 * Test setup - creates isolated database for each test suite
 */
const { initDatabase, closeDatabase, getDb } = require('../server/models/database');

let originalDb = null;

beforeEach(async () => {
  // Close any existing connection
  if (originalDb) {
    closeDatabase();
  }
  
  // Initialize fresh in-memory database
  process.env.DATABASE_PATH = ':memory:';
  await initDatabase();
});

afterEach(() => {
  closeDatabase();
});
