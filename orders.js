// routes/orders.js
const express = require('express');
const db = require('./db');
const { requireAuth, requireRole } = require('./authMiddleware');
const { logAction } = require('./logger');

const router = express.Router();
router.use(requireAuth);

const VALID_STATUSES = ['en_attente', 'validee', 'livree'];

router.get('/', (req, res) => {
  res.json(db.all('orders'));
});

router.get('/:id', (req, res) => {
  const order = db.getById('orders', req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable.' });
  res.json(order);
});

router.patch('/:id/status', requireRole('admin', 'employe'), (req, res) => {
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Statut invalide. Valeurs autorisées: ${VALID_STATUSES.join(', ')}` });
  }
  const existing = db.getById('orders', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Commande introuvable.' });

  const updated = db.update('orders', req.params.id, { status });
  logAction(req.user, 'UPDATE', `commande #${updated.id}`, `Statut → ${status}`);
  res.json(updated);
});

module.exports = router;
