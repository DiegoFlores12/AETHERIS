const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API Aetheris funcionando' }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/news', require('./routes/news.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/donations', require('./routes/donation.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

module.exports = app;
