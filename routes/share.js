const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@primsa/client');
const prisma = new PrismaClient();
const controller = require('../controllers/shareController.js');

router.post('/share/:folderId', controller.shareFolder);

module.exports = router;