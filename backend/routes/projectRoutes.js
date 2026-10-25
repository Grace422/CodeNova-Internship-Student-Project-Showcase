
const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function isValidUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidGitHubUrl(value) {
  try {
    const url = new URL(value);

    return (
      ['http:', 'https:'].includes(url.protocol) &&
      url.hostname.toLowerCase() === 'github.com' &&
      /^\/[^/]+\/[^/]+\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

router.post('/', async (req, res) => {
  try {
    const {
      title,
      student_name,
      description,
      tags,
      github_url,
      demo_url,
    } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof student_name !== 'string' ||
      !student_name.trim() ||
      typeof description !== 'string' ||
      !description.trim() ||
      !Array.isArray(tags) ||
      !tags.every(
        tag => typeof tag === 'string' && tag.trim()
      ) ||
      typeof github_url !== 'string' ||
      typeof demo_url !== 'string'
    ) {
      return res.status(400).json({
        message: 'Please provide all required fields correctly.',
      });
    }

    if (
      title.trim().length > 200 ||
      student_name.trim().length > 150 ||
      tags.length > 20 ||
      tags.some(tag => tag.trim().length > 50)
    ) {
      return res.status(400).json({
        message: 'One or more fields exceed the allowed limits.',
      });
    }

    if (!isValidGitHubUrl(github_url.trim())) {
      return res.status(400).json({
        message: 'Enter a valid GitHub repository URL.',
      });
    }

    if (!isValidUrl(demo_url.trim())) {
      return res.status(400).json({
        message: 'Enter a valid HTTP or HTTPS demo URL.',
      });
    }

    const result = await pool.query(
      `INSERT INTO projects
        (title, student_name, description, tags, github_url, demo_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, student_name, description, tags,
                 github_url, demo_url, status, created_at`,
      [
        title.trim(),
        student_name.trim(),
        description.trim(),
        tags.map(tag => tag.trim()),
        github_url.trim(),
        demo_url.trim(),
      ]
    );

    return res.status(201).json({
      message: 'Project submitted successfully and is awaiting review.',
      project: result.rows[0],
    });
  } catch (error) {
    console.error('Project submission failed:', error.message);

    return res.status(500).json({
      message: 'Unable to submit project right now.',
    });
  }
});


router.get('/', async (req, res) => {
  try {
    const { search = '', tag = '' } = req.query;

    if (
      typeof search !== 'string' ||
      typeof tag !== 'string' ||
      search.length > 200 ||
      tag.length > 50
    ) {
      return res.status(400).json({
        message: 'Invalid search or tag filter.',
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         title,
         student_name,
         description,
         tags,
         github_url,
         demo_url,
         created_at
       FROM projects
       WHERE status = 'approved'
         AND (
           title ILIKE $1
           OR student_name ILIKE $1
           OR description ILIKE $1
         )
         AND (
           $2 = ''
           OR EXISTS (
             SELECT 1
             FROM unnest(tags) AS project_tag
             WHERE LOWER(project_tag) = LOWER($2)
           )
         )
       ORDER BY created_at DESC`,
      [`%${search.trim()}%`, tag.trim()]
    );

    res.json({
      count: result.rows.length,
      projects: result.rows,
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error.message);

    res.status(500).json({
      message: 'Unable to retrieve projects.',
    });
  }
});


module.exports = router;
