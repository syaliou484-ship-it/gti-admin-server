// publicOrders.js
// Route PUBLIQUE (pas d'authentification) : reçoit les demandes de devis / commandes
// envoyées depuis le formulaire du site public gti-senegal.com.
const express = require('express');
const db = require('./db');
const { logAction } = require('./logger');

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

router.post('/orders', (req, res) => {
  const { customerName, customerEmail, customerPhone, message } = req.body || {};

  const errors = [];
  if (!customerName || String(customerName).trim().length < 2) errors.push('Nom requis.');
  if (!customerEmail || !isValidEmail(customerEmail)) errors.push('Email valide requis.');
  if (!message || String(message).trim().length < 5) errors.push('Message/description requis.');

  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const order = db.insert('orders', {
    customerName: String(customerName).trim(),
    customerEmail: String(customerEmail).trim(),
    customerPhone: customerPhone ? String(customerPhone).trim() : '',
    message: String(message).trim(),
    total: 0, // à définir manuellement par l'admin après étude de la demande
    status: 'en_attente',
  });

  logAction(null, 'CREATE', `commande #${order.id}`, `Nouvelle demande de ${order.customerName} (via site public)`);

  res.status(201).json({ success: true, message: 'Votre demande a bien été reçue. Nous vous recontacterons rapidement.' });
});

module.exports = router;
