const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardController.js');
const isAuthenticated = require('../middleware/isAuthenticated.js');

router.post('/login', isAuthenticated, controller.postLogin);

router.get('/signup', isAuthenticated, controller.getSignupPage);
router.post('/signup', isAuthenticated, controller.postNewUser);

router.get('/dashboard', isAuthenticated, controller.getDashboard);

router.get('/', isAuthenticated, controller.getAuthPage);

module.exports = router;