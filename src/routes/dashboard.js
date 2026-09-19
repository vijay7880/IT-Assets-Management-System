import { Router } from 'express';
import { db } from '../config/database.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const [[total], [available], [assigned], [repair], [warranty], [categories], [it], [hr], [safety], [commercial], [quality], [warrantyList]] = await Promise.all([
      db.query('SELECT COUNT(*) AS total FROM Assets'),
      db.query('SELECT COUNT(*) AS total FROM Assets WHERE Status = "Active"'),
      db.query('SELECT COUNT(*) AS total FROM Assigned'),
      db.query('SELECT COUNT(*) AS total FROM Maintenance'),
      db.query('SELECT COUNT(*) AS total FROM Assets WHERE Warranty_Date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)'),
      db.query('SELECT Category, COUNT(*) AS total FROM Assets GROUP BY Category ORDER BY total DESC'),
      db.query('SELECT COUNT(*) AS total FROM Assigned WHERE Department = "IT"'),
      db.query('SELECT COUNT(*) AS total FROM Assigned WHERE Department = "HR"'),
      db.query('SELECT COUNT(*) AS total FROM Assigned WHERE Department = "Safety"'),
      db.query('SELECT COUNT(*) AS total FROM Assigned WHERE Department = "Commercial"'),
      db.query('SELECT COUNT(*) AS total FROM Assigned WHERE Department = "Quality"'),
      db.query('SELECT RDTag_No, Asset_Name, Serial_No, Warranty_Date FROM Assets WHERE Warranty_Date >= CURDATE() AND Warranty_Date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY Warranty_Date ASC LIMIT 5')
    ]);
    res.render('Home', { totalAssets: total[0].total, totalAvailable: available[0].total, totalAssigned: assigned[0].total, totalRepair: repair[0].total, totalWarranty: warranty[0].total, categories, locationIT: it[0].total, locationHR: hr[0].total, locationSF: safety[0].total, locationCom: commercial[0].total, locationQc: quality[0].total, warrantySoon: warrantyList, user: req.session.user });
  } catch (error) { next(error); }
});

router.get('/warranty',async(req,res)=>{
  try{
    const [result] = await db.query("Select * from Assets where Warranty_Date <= DATE_ADD(CURDATE(),INTERVAL 30 day )");
    res.render('warranty',{res:result});

  }
  catch(err){
    console.log(err);
  }
});

export default router;
