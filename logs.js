// routes/logs.js
const express = require('express');
const db = require('./db');
const { requireAuth, requireRole } = require('./authMiddleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', requireRole('admin'), (req, res) => {
  const logs = db.all('logs').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(logs);
});

module.exports = router;
