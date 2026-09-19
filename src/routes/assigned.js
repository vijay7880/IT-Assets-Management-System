import { Router } from 'express';
import { db } from '../config/database.js';
import { allowRoles } from '../middleware/auth.js';

const router = Router();
const fields = ['RDTag_No','E_Name','E_ID','Department','Asset_Name','Asset_Category','Asset_Serial_No','Asset_Model','Assigned_Date'];
const valuesFrom = body => fields.map(field => body[field]);

router.get('/assigned', async (req, res, next) => { try { const [Assigned] = await db.query('SELECT * FROM Assigned'); res.render('Assigned', { Assigned }); } catch (e) { next(e); } });
router.get('/Add_Assigned', allowRoles('manager', 'admin'), async (_req, res, next) => { try { const [result] = await db.query('SELECT * FROM Assets WHERE Status = "Active"'); res.render('Add_Assigned', { res: result }); } catch (e) { next(e); } });
router.post('/assigned', allowRoles('manager', 'admin'), async (req, res, next) => { try { await db.query(`INSERT INTO Assigned (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, valuesFrom(req.body)); await db.query('UPDATE Assets SET Status = ? WHERE Serial_No = ?', ['Assigned', req.body.Asset_Serial_No]); res.send('<script>alert("Assigned Successfully"); window.location.href = "/assigned";</script>'); } catch (e) { next(e); } });
router.get('/assigned_view/:RDTag_No', async (req, res, next) => { try { const [result] = await db.query('SELECT * FROM Assigned WHERE RDTag_No = ?', [req.params.RDTag_No]); res.render('Assigned_view', { Ass: result[0] }); } catch (e) { next(e); } });
router.get('/delete_assigned/:RDTag_No', allowRoles('admin'), async (req, res, next) => { try { await db.query('DELETE FROM Assigned WHERE RDTag_No = ?', [req.params.RDTag_No]); res.send('<script>alert("Data Deleted"); window.location.href = "/assigned";</script>'); } catch (e) { next(e); } });
router.get('/update_assigned/:RDTag_No', allowRoles('manager', 'admin'), async (req, res, next) => { try { const [result] = await db.query('SELECT * FROM Assigned WHERE RDTag_No = ?', [req.params.RDTag_No]); if (!result.length) return res.status(404).send('<h2>Assigned not found</h2><a href="/assigned">Back to Assigned</a>'); res.render('Update_assigned', { Ass: result[0] }); } catch (e) { next(e); } });
router.post('/update_assigned/:RDTag_No', allowRoles('manager', 'admin'), async (req, res, next) => { try { await db.query(`UPDATE Assigned SET ${fields.map(field => `${field} = ?`).join(',')} WHERE RDTag_No = ?`, [...valuesFrom(req.body), req.params.RDTag_No]); res.redirect('/assigned'); } catch (e) { next(e); } });

export default router;
