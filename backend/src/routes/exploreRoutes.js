const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const { exploreQuestions } = require('../controllers/exploreController');

router.get('/', optionalAuth, exploreQuestions);

module.exports = router;
