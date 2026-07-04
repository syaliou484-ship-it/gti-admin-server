// server.js
// Serveur API pour l'espace admin GTI.
// N'affecte en rien les pages publiques du site (index.html, etc.),
// qui restent servies statiquement comme avant.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const logRoutes = require('./routes/logs');

const app = express();

app.use(cors()); // en prod: cors({ origin: 'https://www.gti-senegal.com' })
app.use(express.json({ limit: '1mb' }));

// Toutes les routes admin sont préfixées par /api/admin
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/logs', logRoutes);

app.get('/api/admin/health', (req, res) => res.json({ status: 'ok' }));

// Gestion d'erreurs générique (ne fuite pas de détails techniques au client)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API admin GTI démarrée sur http://localhost:${PORT}`);
});
