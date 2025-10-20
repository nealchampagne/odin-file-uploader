const express = require('express');
const router = express.Router();
const upload = require('../upload.js');
const controller = require('../controllers/folderController.js');

router.post('/', controller.createFolder);
router.get('/', controller.listFolders);
router.post('/:id/upload', upload.single('file'), controller.uploadToFolder);

module.exports = router;