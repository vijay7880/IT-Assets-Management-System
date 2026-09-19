import { Router } from 'express';
import { db } from '../config/database.js';
import { allowRoles } from '../middleware/auth.js';

const router = Router();

function Ticket_No(){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let random = '';
    for(let i=0;i<=6;i++){
        const randomIndex =  Math.floor(Math.random()*chars.length);
        random += chars[randomIndex];
    }
    return 'MT-'+random;
}
const fields = ['RDTag_No','Asset_Name','Asset_Category','Asset_Model','Asset_Serial_No','Problem','Action','Date','Status'];
const insertFields = ['Ticket_No', ...fields];
const valuesFrom = body => fields.map(field => body[field]);

router.get('/maintenance', async (req, res, next) => { try { const [Maint] = await db.query('SELECT * FROM Maintenance'); res.render('Maintenance', { Maint }); } catch (e) { next(e); } });

router.get('/add_main', allowRoles('manager', 'admin'), async (_req, res, next) => { try { const [Maint] = await db.query('SELECT RDTag_No FROM Assets'); res.render('Add_maintenance', { Maint }); } catch (e) { next(e); } });

router.get('/get-asset/:RDTag_No', allowRoles('manager', 'admin'), async (req, res, next) => { try { const [result] = await db.query('SELECT Asset_Name, Category, Model, Serial_No FROM Assets WHERE RDTag_No = ?', [req.params.RDTag_No]); res.json(result[0] || null); } catch (e) { next(e); } });

router.post('/add_maintenance', allowRoles('manager', 'admin'), async (req, res, next) => { try {
    const ticketNo = Ticket_No();
    req.body.Ticket_No = ticketNo;
    await db.query(`INSERT INTO Maintenance (${insertFields.join(',')}) VALUES (${insertFields.map(() => '?').join(',')})`, [req.body.Ticket_No, ...valuesFrom(req.body)]);
     await db.query('UPDATE Assets SET Status = ? WHERE Serial_No = ?', ['In Repair', req.body.Asset_Serial_No]); res.send('<script>alert("Added Successfully"); window.location.href = "/add_main";</script>'); }
      catch (e) { next(e); } });

router.get('/delete_main/:RDTag_No', allowRoles('admin'), async (req, res, next) => { try { await db.query('DELETE FROM Maintenance WHERE RDTag_No = ?', [req.params.RDTag_No]); res.send('<script>alert("Deleted Successfully"); window.location.href = "/maintenance";</script>'); } catch (e) { next(e); } });
router.get('/view_main/:RDTag_No', async (req, res, next) => { try { const [result] = await db.query('SELECT * FROM Maintenance WHERE RDTag_No = ?', [req.params.RDTag_No]); res.render('view_main', { Maint: result[0], user: req.session.user }); } catch (e) { next(e); } });
router.get('/update_maint/:RDTag_No', allowRoles('manager', 'admin'), async (req, res, next) => { try { const [result] = await db.query('SELECT * FROM Maintenance WHERE RDTag_No = ?', [req.params.RDTag_No]); if (!result.length) return res.status(404).send('<h2>Maintenance not found</h2><a href="/maintenance">Back to Maintenance</a>'); res.render('update_maint', { Maint: result[0] }); } catch (e) { next(e); } });
router.post('/update_maint/:RDTag_No', allowRoles('manager', 'admin'), async (req, res, next) => {
     try {
         await db.query(`UPDATE Maintenance SET ${fields.map(field => `${field} = ?`).join(',')} WHERE RDTag_No = ?`, [...valuesFrom(req.body), req.params.RDTag_No]);
    const RDTag_No = req.params.RDTag_No;
await db.query('update Assets set Status = ? where RDTag_No = ?',['Active',RDTag_No]);


res.redirect('/maintenance'); } catch (e) { next(e); } });

export default router;
