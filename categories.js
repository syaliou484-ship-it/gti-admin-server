// routes/categories.js
const express = require('express');
const db = require('./db');
const { requireAuth, requireRole } = require('./authMiddleware');
const { logAction } = require('./logger');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  res.json(db.all('categories'));
});

router.post('/', requireRole('admin', 'employe'), (req, res) => {
  const { name } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: 'Nom de catégorie invalide.' });
  }
  const category = db.insert('categories', { name: String(name).trim() });
  logAction(req.user, 'CREATE', `catégorie #${category.id}`, category.name);
  res.status(201).json(category);
});

router.put('/:id', requireRole('admin', 'employe'), (req, res) => {
  const { name } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: 'Nom de catégorie invalide.' });
  }
  const existing = db.getById('categories', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Catégorie introuvable.' });

  const updated = db.update('categories', req.params.id, { name: String(name).trim() });
  logAction(req.user, 'UPDATE', `catégorie #${updated.id}`, updated.name);
  res.json(updated);
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const existing = db.getById('categories', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Catégorie introuvable.' });

  db.remove('categories', req.params.id);
  logAction(req.user, 'DELETE', `catégorie #${req.params.id}`, existing.name);
  res.json({ success: true });
});

module.exports = router;
