const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const controller = require('../controllers/fileController.js');

router.post('/upload', upload.single('file'), controller.uploadFile);

router.get('/:id', controller.getFileById);

router.get('/:id/download', controller.downloadFile);

module.exports = router;