// seed.js — à exécuter une seule fois : node seed.js
// Crée un compte admin initial + quelques données de démonstration.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@gti-senegal.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChangeMoi123!';

function seed() {
  const existingAdmin = db.findOne('users', (u) => u.email === ADMIN_EMAIL);
  if (!existingAdmin) {
    db.insert('users', {
      name: 'Administrateur GTI',
      email: ADMIN_EMAIL,
      passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      role: 'admin',
    });
    console.log(`✅ Compte admin créé : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('⚠️  Changez ce mot de passe dès la première connexion.');
  } else {
    console.log('ℹ️  Un compte admin existe déjà, aucune action.');
  }

  if (db.all('categories').length === 0) {
    db.insert('categories', { name: 'Chaudronnerie' });
    db.insert('categories', { name: 'Électricité industrielle' });
    db.insert('categories', { name: 'Engrais foliaires & biostimulants' });
    console.log('✅ Catégories de démonstration créées.');
  }

  if (db.all('products').length === 0) {
    const cats = db.all('categories');
    db.insert('products', { name: 'Cuve inox 500L', description: 'Cuve de stockage industrielle', price: 750000, stock: 4, categoryId: cats[0]?.id || null });
    db.insert('products', { name: 'Armoire électrique standard', description: 'Armoire de distribution industrielle', price: 420000, stock: 8, categoryId: cats[1]?.id || null });
    console.log('✅ Produits de démonstration créés.');
  }

  console.log('🎉 Initialisation terminée.');
}

seed();
