import mysql from 'mysql2/promise';
import env from './env.js';

export const db = mysql.createPool(env.db);

export async function initializeDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS Users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE,
      role ENUM('admin','manager','user') NOT NULL DEFAULT 'user',
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [userColumns] = await db.query("SHOW COLUMNS FROM Users LIKE 'email'");
  if (userColumns.length === 0) {
    await db.query('ALTER TABLE Users ADD COLUMN email VARCHAR(255) UNIQUE AFTER name');
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS Assets (
      RDTag_No VARCHAR(100) NOT NULL PRIMARY KEY,
      Asset_Name VARCHAR(255),
      Category VARCHAR(100),
      Model VARCHAR(255),
      Serial_No VARCHAR(255),
      Host VARCHAR(255),
      Wifi_mac VARCHAR(100),
      Lan_mac VARCHAR(100),
      IP_Address VARCHAR(100),
      PO_No VARCHAR(100),
      Invoice_No VARCHAR(100),
      Invoice_Date DATE,
      Cost DECIMAL(12,2),
      Purchase_Date DATE,
      Warranty_Date DATE,
      Status VARCHAR(50) NOT NULL DEFAULT 'Active'
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS Assigned (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      RDTag_No VARCHAR(100) NOT NULL,
      E_Name VARCHAR(255),
      E_ID VARCHAR(100),
      Department VARCHAR(100),
      Asset_Name VARCHAR(255),
      Asset_Category VARCHAR(100),
      Asset_Serial_No VARCHAR(255),
      Asset_Model VARCHAR(255),
      Assigned_Date DATE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS Maintenance (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      RDTag_No VARCHAR(100) NOT NULL,
      Asset_Name VARCHAR(255),
      Asset_Category VARCHAR(100),
      Asset_Model VARCHAR(255),
      Asset_Serial_No VARCHAR(255),
      Problem TEXT,
      Action TEXT,
      Status VARCHAR(100)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS Scrap (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      RDTag_No VARCHAR(100) NOT NULL,
      Asset_Name VARCHAR(255),
      Category VARCHAR(100),
      Model VARCHAR(255),
      Serial_No VARCHAR(255),
      Department VARCHAR(100),
      Host VARCHAR(255),
      Wifi_mac VARCHAR(100),
      Lan_mac VARCHAR(100),
      IP_Address VARCHAR(100),
      PO_No VARCHAR(100),
      Invoice_No VARCHAR(100),
      Invoice_Date DATE,
      Cost DECIMAL(12,2),
      Warranty_Date DATE,
      Purchase_Date DATE,
      Problem TEXT,
      Scrap_Date DATE
    )
  `);
}
