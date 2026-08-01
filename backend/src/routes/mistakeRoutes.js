const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMistakes, updateMistake } = require('../controllers/mistakeController');

router.get('/', authMiddleware, getMistakes);
router.patch('/:id', authMiddleware, updateMistake);

module.exports = router;