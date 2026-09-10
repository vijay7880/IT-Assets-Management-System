import { Router } from 'express';
import xlsx from 'xlsx';
import fs from 'fs';
import { db } from '../config/database.js';
import { allowRoles } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
const columns = ['RDTag_No','Asset_Name','Category','Model','Serial_No','Host','Wifi_mac','Lan_mac','IP_Address','PO_No','Invoice_No','Invoice_Date','Cost','Purchase_Date','Warranty_Date','Status'];

router.post('/import', upload.single('file'), allowRoles('manager', 'admin'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).send('Please select a file');
    const workbook = xlsx.readFile(req.file.path, { cellDates: true });
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    if (!data.length) return res.status(400).send('File is empty');
    const missing = columns.filter(column => !Object.keys(data[0]).includes(column));
    if (missing.length) return res.status(400).send(`Missing columns: ${missing.join(', ')}`);
    const values = data.map(row => columns.map(column => row[column]));
    await db.query(`INSERT INTO Assets (${columns.join(',')}) VALUES ?`, [values]);
    res.send('<script>alert("File imported Successfully"); window.location.href = "/assets";</script>');
  } catch (error) { next(error); } finally { if (req.file?.path) await fs.promises.unlink(req.file.path).catch(() => {}); }
});

router.get('/Export', allowRoles('manager', 'admin'), async (_req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM Assets');
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Assets');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').attachment('Assets.xlsx').send(xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' }));
  } catch (error) { next(error); }
});

export default router;
