const express = require('express');
const router = express.Router();
const controller = require('../controllers/shareController.js');
const { sessionAuth } = require('../middleware/sessionAuth.js');

router.post('/:folderId', sessionAuth, controller.shareFolder);
router.get('/:folderId', sessionAuth, controller.getSharedFolderById);

module.exports = router;