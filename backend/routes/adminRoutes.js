
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();
const authenticateAdmin = require('../middleware/authMiddleware');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Username and password are required.',
      });
    }

    const result = await pool.query(
      `SELECT id, username, password_hash
       FROM admins
       WHERE username = $1`,
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid username or password.',
      });
    }

    const admin = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid username or password.',
      });
    }

    const token = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
        role: 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Login successful.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Admin login failed:', error.message);

    return res.status(500).json({
      message: 'Unable to log in right now.',
    });
  }
});


router.get(
  '/projects',
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, title, student_name, description, tags,
                github_url, demo_url, status, created_at, reviewed_at
         FROM projects
         ORDER BY
           CASE status
             WHEN 'pending' THEN 1
             WHEN 'approved' THEN 2
             WHEN 'rejected' THEN 3
           END,
           created_at DESC`
      );

      return res.json({
        count: result.rows.length,
        projects: result.rows,
      });
    } catch (error) {
      console.error('Admin project retrieval failed:', error.message);

      return res.status(500).json({
        message: 'Unable to retrieve submissions.',
      });
    }
  }
);

router.patch(
  '/projects/:id/status',
  authenticateAdmin,
  async (req, res) => {
    try {
      const projectId = Number(req.params.id);
      const { status } = req.body;

      if (
        !Number.isSafeInteger(projectId) ||
        projectId <= 0
      ) {
        return res.status(400).json({
          message: 'Invalid project ID.',
        });
      }

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          message: 'Status must be approved or rejected.',
        });
      }

      const result = await pool.query(
        `UPDATE projects
         SET status = $1,
             reviewed_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, title, status, reviewed_at`,
        [status, projectId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: 'Project not found.',
        });
      }

      return res.json({
        message: `Project ${status} successfully.`,
        project: result.rows[0],
      });
    } catch (error) {
      console.error('Project moderation failed:', error.message);

      return res.status(500).json({
        message: 'Unable to update project status.',
      });
    }
  }
);



module.exports = router;
