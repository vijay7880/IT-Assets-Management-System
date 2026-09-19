import { Router } from 'express';
import { db } from '../config/database.js';
import { allowRoles } from '../middleware/auth.js';

const router = Router();
const assetFields = ['RDTag_No','Asset_Name','Category','Model','Serial_No','Host','Wifi_mac','Lan_mac','IP_Address','PO_No','Invoice_No','Invoice_Date','Cost','Purchase_Date','Warranty_Date','Status'];
const valuesFrom = body => assetFields.map(field => body[field]);

router.get('/assets', async (req, res, next) => 
    { 
        try
         {
             const [Assets] = await db.query('SELECT * FROM Assets'); res.render('Assets', { Assets }); }
              catch (e) {
                 next(e);
                 } });
router.get('/search', async (req, res, next) => { try { const value = `%${req.query.name || ''}%`; const [Assets] = await db.query('SELECT * FROM Assets WHERE RDTag_No LIKE ? OR Asset_Name LIKE ? OR Category LIKE ?', [value, value, value]); res.render('Assets', { Assets }); } catch (e) { next(e); } });
router.get('/avlist', async (req, res, next) => { try { const [result] = await db.query('SELECT * FROM Assets WHERE Status = "Active"'); res.render('Available_Assets', { res: result }); } catch (e) { next(e); } });
router.get('/add', allowRoles('admin', 'manager'), (_req, res) => res.render('Add_Asset'));
router.post('/assets', allowRoles('manager', 'admin'), async (req, res, next) => { try { await db.query(`INSERT INTO Assets (${assetFields.join(',')}) VALUES (${assetFields.map(() => '?').join(',')})`, valuesFrom(req.body)); res.send('<script>alert("Asset Added Successfully"); window.location.href = "/assets";</script>'); } catch (e) { next(e); } });
router.get('/update/:RDTag_No', allowRoles('manager', 'admin'), async (req, res, next) => { try { const [result] = await db.query('SELECT * FROM Assets WHERE RDTag_No = ?', [req.params.RDTag_No]); if (!result.length) return res.status(404).send('<h2>Asset not found</h2><a href="/assets">Back to Assets</a>'); res.render('Update', { Assets: result[0] }); } catch (e) { next(e); } });
router.post('/update/:RDTag_No', allowRoles('manager', 'admin'), async (req, res, next) => { try { await db.query(`UPDATE Assets SET ${assetFields.map(field => `${field} = ?`).join(',')} WHERE RDTag_No = ?`, [...valuesFrom(req.body), req.params.RDTag_No]); res.redirect('/assets'); } catch (e) { next(e); } });
router.get('/delete/:RDTag_No', allowRoles('admin'), async (req, res, next) => { try { await db.query('DELETE FROM Assets WHERE RDTag_No = ?', [req.params.RDTag_No]); res.send('<script>alert("Asset Deleted Successfully"); window.location.href = "/assets";</script>'); } catch (e) { next(e); } });
router.get('/asset_view/:RDTag_No', async (req, res, next) => { try { const [result] = await db.query('SELECT * FROM Assets WHERE RDTag_No = ?', [req.params.RDTag_No]); res.render('Asset_view', { Assets: result[0], user: req.session.user }); } catch (e) { next(e); } });

export default router;
