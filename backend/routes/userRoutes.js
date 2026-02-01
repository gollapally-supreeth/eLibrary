const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkAuth } = require('../middleware/auth');

router.get('/profile', checkAuth, userController.getProfile);
router.put('/profile', checkAuth, userController.updateProfile);
router.put('/profile/avatar', checkAuth, userController.updateAvatar);

module.exports = router;
