const express = require('express');
const router = express.Router();
const controller = require('../controllers/shareController.js');
const { sessionAuth } = require('../middleware/sessionAuth.js');

router.post('/share/:folderId', sessionAuth, controller.shareFolder);
router.get('/:id', sessionAuth, controller.getSharedFolder);

module.exports = router;