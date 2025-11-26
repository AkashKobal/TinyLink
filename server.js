const express = require('express');
const cors = require('cors');
const linkRoutes = require('./src/routes/linkRoutes');
const { redirectHandler } = require('./src/controllers/linkController');
const { pool } = require('./src/config/db');

const app = express();

app.use(cors());
app.use(express.json());

// API namespace
app.use('/api/links', linkRoutes);

// Healthcheck
app.get('/health', (req, res) => {
    res.json({ ok: true, version: '1.0' });
});

// Redirect route (must be after API routes)
app.get('/:code', redirectHandler);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`TinyLink backend listening on port http://localhost:${PORT}`);
});
