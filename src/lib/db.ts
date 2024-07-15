import { createPool, Pool } from 'mysql2/promise';

// Create MySQL pool
export const pool: Pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sowtexnet',
  Promise: global.Promise, // Make sure to include this for TypeScript to recognize the Promise type
});