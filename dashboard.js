// routes/dashboard.js
const express = require('express');
const db = require('./db');
const { requireAuth } = require('./authMiddleware');

const router = express.Router();
router.use(requireAuth);

router.get('/stats', (req, res) => {
  const products = db.all('products');
  const orders = db.all('orders');
  const users = db.all('users');

  const revenueByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + Number(o.total || 0);
    return acc;
  }, {});

  // Activité des 7 derniers jours (commandes créées par jour)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = orders.filter((o) => (o.createdAt || '').slice(0, 10) === key).length;
    days.push({ date: key, count });
  }

  res.json({
    totals: {
      products: products.length,
      orders: orders.length,
      users: users.length,
      pendingOrders: orders.filter((o) => o.status === 'en_attente').length,
    },
    revenueByStatus,
    activity7d: days,
  });
});

module.exports = router;
