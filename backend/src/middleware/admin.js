// Restricts a route to admins. MUST run after `protect`, which sets req.user.
function admin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = admin;
