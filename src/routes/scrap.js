import { Router } from 'express';
import { db } from '../config/database.js';
import { allowRoles } from '../middleware/auth.js';

const router = Router();

router.get('/scrap', async (req, res, next) => { try { const [result] = await db.query('SELECT * FROM Scrap'); res.render('Scrap', { result }); } catch (e) { next(e); } });

router.get('/add_scrap', allowRoles('manager', 'admin'), (_req, res) => res.render('Add_scrap'));
router.post('/add_scrap', allowRoles('manager', 'admin'), async (req, res, next) => { const connection = await db.getConnection(); try { const { Model, Serial_No, Problem, Scrap_Date } = req.body; await connection.beginTransaction(); await connection.query(`INSERT INTO Scrap (RDTag_No,Asset_Name,Category,Model,Serial_No,Host,Wifi_mac,Lan_mac,IP_Address,PO_No,Invoice_No,Invoice_Date,Cost,Warranty_Date,Purchase_Date,Problem,Scrap_Date) SELECT RDTag_No,Asset_Name,Category,Model,Serial_No,Host,Wifi_mac,Lan_mac,IP_Address,PO_No,Invoice_No,Invoice_Date,Cost,Warranty_Date,Purchase_Date,?,? FROM Assets WHERE Serial_No = ?`, [Problem, Scrap_Date, Serial_No]); await connection.query('DELETE FROM Assets WHERE Serial_No = ?', [Serial_No]);
await connection.query('Delete from Assigned where Asset_Serial_No = ?',[Serial_No]);
await connection.query('Delete from Maintenance where Asset_Serial_No = ?',[Serial_No]);



await connection.commit(); res.redirect('/scrap'); } catch (e) { await connection.rollback(); next(e); } finally { connection.release(); } });
router.get('/view_scrap/:RDTag_No', async (req, res, next) => { try { const [result] = await db.query('SELECT * FROM Scrap WHERE RDTag_No = ?', [req.params.RDTag_No]); res.render('view_scrap', { res: result[0] }); } catch (e) { next(e); } });
router.get('/delete_scrap/:RDTag_No', allowRoles('admin'), async (req, res, next) => { try { await db.query('DELETE FROM Scrap WHERE RDTag_No = ?', [req.params.RDTag_No]); res.send('<script>alert("Scrap Deleted Successfully"); window.location.href = "/scrap";</script>'); } catch (e) { next(e); } });

export default router;
