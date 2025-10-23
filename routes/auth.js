const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController.js');
const { redirectIfAuthenticated } = require('../middleware/sessionAuth.js');

router.get('/', redirectIfAuthenticated, controller.getAuthPage);

router.post('/login', redirectIfAuthenticated, controller.postLogin);
router.get('/logout', controller.logoutUser);
router.get('/signup', redirectIfAuthenticated, controller.getSignupPage);
router.post('/signup', redirectIfAuthenticated, controller.postNewUser);

module.exports = router;