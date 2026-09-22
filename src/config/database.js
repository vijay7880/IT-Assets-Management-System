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

  await db.query(`CREATE TABLE IF NOT EXISTS Assets(Sno int auto_increment primary key, RDTag_No varchar(20)not null,Asset_Name varchar(200),Category varchar(200)not null,Model varchar(200) not null,
Serial_No varchar(200) not null, Host varchar(200) not null,Wifi_mac varchar(200) not null,
Lan_mac varchar(200) not null, IP_Address varchar(200) not null, PO_No varchar(200) not null, Invoice_No varchar(200) not null,Invoice_Date date not null,
Cost varchar(200) not null,Purchase_Date date not null,Warranty_Date date not null,Status varchar(200))`);

await db.query(`create table if not exists Assigned(RDTag_No varchar(50) not null,E_Name varchar(50) not null,E_ID varchar(50) not null,Department varchar(50) not null,
Asset_Name varchar(50) not null,Asset_Category varchar(50) not null,Asset_Serial_No varchar(50) not null,
Asset_Model varchar(50) not null,Assigned_Date date not null)`);

await db.query(`
create table if not exists Maintenance(Ticket_No varchar(20) unique not null, RDTag_No varchar(50) not null,Asset_Name varchar(50) not null, Asset_Category varchar(50) not null, Asset_Model varchar(50) not null,Asset_Serial_No varchar(50)
not null,Problem varchar(200) not null, Action varchar(200) not null,Date date not null,Status varchar(50)not null)`);

await db.query(`create table if not exists Scrap(RDTag_No varchar(20)not null,Asset_Name varchar(200)not null,Category varchar(50)not null,Model varchar(50) not null,
Serial_No varchar(50) not null, Host varchar(50) not null,Wifi_mac varchar(50) not null,
Lan_mac varchar(50) not null, IP_Address varchar(50) not null, PO_No varchar(50) not null, Invoice_No varchar(50) not null,Invoice_Date date not null,
Cost varchar(50) not null,Warranty_Date date not null,Purchase_Date date not null,Problem varchar(200),Scrap_Date date)`);


}

