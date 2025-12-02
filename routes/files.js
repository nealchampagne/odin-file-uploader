const express = require('express');
const router = express.Router();
const controller = require('../controllers/fileController.js');
const upload = require('../upload.js');
const { sessionAuth } = require('../middleware/sessionAuth.js');

router.post('/upload', sessionAuth, upload.single('file'), controller.uploadFile);

router.get('/:id', sessionAuth, controller.viewFileDetails);

router.get('/:id/download', sessionAuth, controller.downloadFile);

module.exports = router;