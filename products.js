// routes/products.js
const express = require('express');
const db = require('./db');
const { requireAuth, requireRole } = require('./authMiddleware');
const { logAction } = require('./logger');

const router = express.Router();
router.use(requireAuth);

function validateProduct(body, { partial = false } = {}) {
  const errors = [];
  if (!partial || body.name !== undefined) {
    if (!body.name || String(body.name).trim().length < 2) errors.push('Nom du produit invalide.');
  }
  if (!partial || body.price !== undefined) {
    if (body.price === undefined || isNaN(Number(body.price)) || Number(body.price) < 0) {
      errors.push('Prix invalide.');
    }
  }
  if (!partial || body.stock !== undefined) {
    if (body.stock === undefined || isNaN(Number(body.stock)) || Number(body.stock) < 0) {
      errors.push('Stock invalide.');
    }
  }
  return errors;
}

router.get('/', (req, res) => {
  res.json(db.all('products'));
});

router.get('/:id', (req, res) => {
  const product = db.getById('products', req.params.id);
  if (!product) return res.status(404).json({ error: 'Produit introuvable.' });
  res.json(product);
});

router.post('/', requireRole('admin', 'employe'), (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const { name, description = '', price, stock, categoryId = null } = req.body;
  const product = db.insert('products', {
    name: String(name).trim(),
    description: String(description).trim(),
    price: Number(price),
    stock: Number(stock),
    categoryId: categoryId ? Number(categoryId) : null,
  });

  logAction(req.user, 'CREATE', `produit #${product.id}`, product.name);
  res.status(201).json(product);
});

router.put('/:id', requireRole('admin', 'employe'), (req, res) => {
  const errors = validateProduct(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const existing = db.getById('products', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produit introuvable.' });

  const patch = {};
  ['name', 'description', 'price', 'stock', 'categoryId'].forEach((field) => {
    if (req.body[field] !== undefined) patch[field] = req.body[field];
  });

  const updated = db.update('products', req.params.id, patch);
  logAction(req.user, 'UPDATE', `produit #${updated.id}`, updated.name);
  res.json(updated);
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const existing = db.getById('products', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produit introuvable.' });

  db.remove('products', req.params.id);
  logAction(req.user, 'DELETE', `produit #${req.params.id}`, existing.name);
  res.json({ success: true });
});

module.exports = router;
