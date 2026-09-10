const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validateObjectIdParam, validateMistakeUpdate } = require('../middleware/validate');
const { getMistakes, updateMistake } = require('../controllers/mistakeController');

router.get('/', authMiddleware, getMistakes);
router.patch('/:id', authMiddleware, validateObjectIdParam('id'), validateMistakeUpdate, updateMistake);

module.exports = router;
