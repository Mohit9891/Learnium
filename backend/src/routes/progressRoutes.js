const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const { getProgressOverview } = require('../controllers/progressController');

router.get('/overview', optionalAuth, getProgressOverview);

module.exports = router;
