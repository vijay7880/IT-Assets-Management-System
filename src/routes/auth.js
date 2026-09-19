import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';

const router = Router();

router.get('/reset', (_req, res) => res.render('Reset', { error: null }));
router.post('/reset', async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || password !== confirmPassword) {
      return res.render('Reset', { error: 'Please provide a valid email and matching passwords.' });
    }
    const [admins] = await db.query("SELECT id FROM Users WHERE email = ? AND role = 'admin'", [email]);
    if (admins.length === 0) return res.render('Reset', { error: 'Admin email does not match.' });
    await db.query('UPDATE Users SET password = ? WHERE id = ?', [await bcrypt.hash(password, 10), admins[0].id]);
    res.send('<script>alert("Password Reset Successfully"); window.location.href = "/login"</script>');
  } catch (error) { next(error); }
});

router.get('/user_reset', (_req, res) => res.render('user-Reset', { error: null }));
router.post('/user_reset', async (req, res, next) => {
  try {
    const { name, password, confirmPassword } = req.body;
    if (!name || !password || password !== confirmPassword) {
      return res.render('user-Reset', { error: 'Please provide a valid name and matching passwords.' });
    }
    
    const [result] = await db.query('UPDATE Users SET password = ? WHERE name = ?', [await bcrypt.hash(password, 10), name]);
    if (result.affectedRows === 0) return res.render('user-Reset', { error: 'User name does not match.' });
    res.send('<script>alert("Password Reset Successfully"); window.location.href = "/login"</script>');
  } catch (error) { next(error); }
});



router.get('/login', async (req, res, next) => {
  try {
    if (req.session.userId) return res.redirect('/');
    const [users] = await db.query('SELECT id FROM Users LIMIT 1');
    if (users.length === 0) return res.redirect('/register');
    res.render('login', { error: null });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) return res.render('login', { error: 'username and password are required.' });
    const [rows] = await db.query('SELECT id, name, email, role, password FROM Users WHERE name = ?', [name]);
    if (rows.length === 0) return res.render('login', { error: 'Invalid name or password.' });
    const user = rows[0];
    if (!await bcrypt.compare(password, user.password)) return res.render('login', { error: 'Invalid name or password.' });
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userRole = user.role;
    req.session.user = { name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch (error) { next(error); }
});

router.get('/register', async (req, res, next) => {
  try {
    const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM Users');
    if (Number(count) === 0) return res.render('Ragister', { error: null, firstRegistration: true });
    if (req.session.userRole !== 'admin') return res.status(403).send('Only an admin can register new users.');
    res.render('Ragister', { error: null, firstRegistration: false });
  } catch (error) { next(error); }
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, role, password, confirmPassword } = req.body;
    const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM Users');
    const firstRegistration = Number(count) === 0;
    if (!firstRegistration && req.session.userRole !== 'admin') return res.status(403).send('Only an admin can register new users.');
    if (!name || !password || !confirmPassword || (firstRegistration && !email)) return res.render('Ragister', { error: 'All required fields are required.', firstRegistration });
    if (password !== confirmPassword) return res.render('Ragister', { error: 'Passwords do not match.', firstRegistration });
    const selectedRole = firstRegistration ? 'admin' : role;
    if (!firstRegistration && !['manager', 'user'].includes(selectedRole)) return res.render('Ragister', { error: 'Only manager or user accounts can be created.', firstRegistration: false });
    const [existing] = await db.query(
      firstRegistration ? 'SELECT id FROM Users WHERE name = ? OR email = ?' : 'SELECT id FROM Users WHERE name = ?',
      firstRegistration ? [name, email] : [name]
    );
    if (existing.length > 0) return res.render('Ragister', { error: 'This name or email is already registered.', firstRegistration });
    await db.query('INSERT INTO Users (name, email, role, password) VALUES (?, ?, ?, ?)', [name, firstRegistration ? email : null, selectedRole, await bcrypt.hash(password, 10)]);
    if (firstRegistration) return res.redirect('/login');
    res.redirect('/');
  } catch (error) { next(error); }
});

router.get('/logout', (req, res, next) => req.session.destroy(error => error ? next(error) : res.redirect('/login')));

export default router;
