import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'user_bbff',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);
