const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, updateSettings, deleteAccount, getUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getUserStats);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.put('/settings', updateSettings);
router.delete('/account', deleteAccount);

module.exports = router;
