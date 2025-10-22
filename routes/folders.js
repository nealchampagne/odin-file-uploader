const express = require('express');
const router = express.Router();
const upload = require('../upload.js');
const controller = require('../controllers/folderController.js');

router.post('/', controller.createFolder);
router.get('/', controller.listFolders);

module.exports = router;