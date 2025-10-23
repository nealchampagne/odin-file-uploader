const express = require('express');
const router = express.Router();
const controller = require('../controllers/folderController.js');
const { sessionAuth } = require('../middleware/sessionAuth.js');

router.get('/:id', sessionAuth, controller.getFolderContents);

router.post('/create', sessionAuth, controller.createFolder);

router.get('/', sessionAuth, controller.getDashboard);

module.exports = router;