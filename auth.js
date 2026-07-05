// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { requireAuth } = require('./authMiddleware');
const { logAction } = require('./logger');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = '8h';

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  const user = db.findOne('users', (u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  // Seuls admin et employé peuvent entrer dans l'espace admin
  if (!['admin', 'employe'].includes(user.role)) {
    return res.status(403).json({ error: "Ce compte n'a pas accès à l'espace admin." });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });

  logAction(user, 'LOGIN', `utilisateur #${user.id}`, 'Connexion à l\'espace admin');

  res.json({ token, user: payload });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
