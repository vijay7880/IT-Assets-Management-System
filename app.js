import express from 'express';
import path from 'path';
import session from 'express-session';
import env from './src/config/env.js';
import { initializeDatabase } from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import dashboardRoutes from './src/routes/dashboard.js';
import assetRoutes from './src/routes/assets.js';
import assignedRoutes from './src/routes/assigned.js';
import maintenanceRoutes from './src/routes/maintenance.js';
import scrapRoutes from './src/routes/scrap.js';
import importExportRoutes from './src/routes/importExport.js';

const app = express();
const publicRoutes = ['/login', '/register', '/signup', '/logout', '/reset'];

app.set('view engine', 'ejs');
app.set('views', path.resolve('views'));
app.use(express.static(path.resolve('public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({ secret: env.sessionSecret, resave: false, saveUninitialized: false, cookie: { maxAge: 1000 * 60 * 60 * 2, secure: env.nodeEnv === 'production' } }));
app.use((req, res, next) => { res.locals.currentUser = req.session?.userName ?? null; res.locals.currentUserRole = req.session?.userRole ?? null; next(); });
app.use((req, res, next) => { if (publicRoutes.includes(req.path) || req.session.userId) return next(); res.redirect('/login'); });

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(assetRoutes);
app.use(assignedRoutes);
app.use(maintenanceRoutes);
app.use(scrapRoutes);
app.use(importExportRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  if (!res.headersSent) res.status(500).send(env.nodeEnv === 'production' ? 'Something went wrong.' : `Server error: ${error.message}`);
});

export async function startServer() {
  await initializeDatabase();
  return app.listen(env.port, () => console.log(`IT Asset System running on port ${env.port}`));
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(error => { console.error('Unable to start application:', error); process.exitCode = 1; });
}

export default app;