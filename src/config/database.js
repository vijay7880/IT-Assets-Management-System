import mysql from 'mysql2/promise';
import env from './env.js';

export const db = mysql.createPool(env.db);

export async function initializeDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS Users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      role ENUM('admin','manager','user') NOT NULL DEFAULT 'user',
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
