import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';

const router = Router();

router.get('/reset', (_req, res) => res.render('Reset'));
router.post('/reset', async (req, res, next) => {
  try {
    const { name, role, password, confirmPassword } = req.body;
    if (!name || !role || !password || password !== confirmPassword) {
      return res.render('Reset', { error: 'Please provide matching passwords and all required fields.' });
    }
    await db.query('UPDATE Users SET password = ? WHERE name = ? AND role = ?', [await bcrypt.hash(password, 10), name, role]);
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
    const [rows] = await db.query('SELECT id, name, role, password FROM Users WHERE name = ?', [name]);
    if (rows.length === 0) return res.redirect('/register');
    const user = rows[0];
    if (!await bcrypt.compare(password, user.password)) return res.render('login', { error: 'Invalid name or password.' });
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userRole = user.role;
    req.session.user = { name: user.name, role: user.role };
    res.redirect('/');
  } catch (error) { next(error); }
});

router.get(['/register', '/signup'], (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('Ragister', { error: null });
});

router.post(['/register', '/signup'], async (req, res, next) => {
  try {
    const { name, role, password, confirmPassword } = req.body;
    if (!name || !role || !password || !confirmPassword) return res.render('Ragister', { error: 'All fields are required.' });
    if (password !== confirmPassword) return res.render('Ragister', { error: 'Passwords do not match.' });
    const [existing] = await db.query('SELECT id FROM Users WHERE name = ?', [name]);
    if (existing.length > 0) return res.render('Ragister', { error: 'This name is already registered.' });
    const [result] = await db.query('INSERT INTO Users (name, role, password) VALUES (?, ?, ?)', [name, role, await bcrypt.hash(password, 10)]);
    req.session.userId = result.insertId;
    req.session.userName = name;
    req.session.userRole = role;
    res.redirect('/');
  } catch (error) { next(error); }
});

router.get('/logout', (req, res, next) => req.session.destroy(error => error ? next(error) : res.redirect('/login')));

export default router;
