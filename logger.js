// logger.js
// Journalise les actions importantes effectuées dans l'admin.
const db = require('./db');

function logAction(user, action, target, details = '') {
  db.insert('logs', {
    userId: user?.id ?? null,
    userName: user?.name ?? 'Système',
    action, // ex: "CREATE", "UPDATE", "DELETE"
    target, // ex: "produit #12", "commande #4"
    details,
  });
}

module.exports = { logAction };
