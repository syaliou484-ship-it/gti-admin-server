// routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { requireAuth, requireRole } = require('./authMiddleware');
const { logAction } = require('./logger');

const router = express.Router();
router.use(requireAuth);

const VALID_ROLES = ['admin', 'employe', 'client'];

function sanitize(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// Liste des utilisateurs — admin uniquement (données sensibles)
router.get('/', requireRole('admin'), (req, res) => {
  res.json(db.all('users').map(sanitize));
});

router.post('/', requireRole('admin'), (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Champs invalides. Rôles valides: admin, employe, client.' });
  }
  const exists = db.findOne('users', (u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) return res.status(409).json({ error: 'Cet email est déjà utilisé.' });

  const passwordHash = bcrypt.hashSync(String(password), 10);
  const user = db.insert('users', { name: String(name).trim(), email: String(email).trim(), passwordHash, role });

  logAction(req.user, 'CREATE', `utilisateur #${user.id}`, `${user.name} (${role})`);
  res.status(201).json(sanitize(user));
});

router.put('/:id', requireRole('admin'), (req, res) => {
  const existing = db.getById('users', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const { name, role, password } = req.body || {};
  const patch = {};
  if (name) patch.name = String(name).trim();
  if (role) {
    if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Rôle invalide.' });
    patch.role = role;
  }
  if (password) patch.passwordHash = bcrypt.hashSync(String(password), 10);

  const updated = db.update('users', req.params.id, patch);
  logAction(req.user, 'UPDATE', `utilisateur #${updated.id}`, updated.name);
  res.json(sanitize(updated));
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
  }
  const existing = db.getById('users', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  db.remove('users', req.params.id);
  logAction(req.user, 'DELETE', `utilisateur #${req.params.id}`, existing.name);
  res.json({ success: true });
});

module.exports = router;
