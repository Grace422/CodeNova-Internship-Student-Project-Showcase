
const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
    override: true,
});

const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function createAdmin() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        throw new Error(
            'Admin credentials could not be loaded from backend/.env'
        );
    }

    if (password.length < 12) {
        throw new Error('Admin password must be at least 12 characters.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
        `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING
     RETURNING id`,
        [username, passwordHash]
    );

    if (result.rowCount === 0) {
        console.log('Admin account already exists:', username);
    } else {
        console.log('Admin account created successfully:', username);
    }
}

createAdmin()
    .catch((error) => {
        console.error('Admin setup failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
