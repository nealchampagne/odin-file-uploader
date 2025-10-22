const express = require('express');
const router = express.Router();
const controller = require('../controllers/shareController.js');
const isAuthenticated = require('../middleware/isAuthenticated.js');

router.post('/share/:folderId', isAuthenticated, controller.shareFolder);
router.get('/:id', isAuthenticated, controller.getSharedFolder);

module.exports = router;