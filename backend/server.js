const projectRoutes = require('./routes/projectRoutes');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Student Project Showcase API is running!',
    });
});

app.get('/api/health/db', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT current_database() AS database'
        );

        res.json({
            message: 'Database connected successfully!',
            database: result.rows[0].database,
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);

        res.status(500).json({
            message: 'Database connection failed.',
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
