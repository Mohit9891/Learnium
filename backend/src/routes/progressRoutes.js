const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const { getProgressOverview, getActivity } = require('../controllers/progressController');

router.get('/overview', optionalAuth, getProgressOverview);
router.get('/activity', optionalAuth, getActivity);

module.exports = router;
