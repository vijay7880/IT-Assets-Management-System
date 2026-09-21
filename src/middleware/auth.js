export function isLoggedIn(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login');
    if (!roles.includes(req.session.userRole)) {
      return res.status(403).send('<h2>Access Denied</h2><p>You do not have permission to access this page.</p><a href="/">Go back to Home</a>');
    }
    next();
  };
}

