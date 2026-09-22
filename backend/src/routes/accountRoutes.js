const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { changePassword, resetProgress, deleteAccount } = require('../controllers/accountController');

router.use(authMiddleware);

router.post('/change-password', changePassword);
router.delete('/progress', resetProgress);
router.delete('/', deleteAccount);

module.exports = router;
