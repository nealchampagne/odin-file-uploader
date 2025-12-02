const express = require('express');
const router = express.Router();
const controller = require('../controllers/folderController.js');
const { renameFile } = require('../controllers/fileController.js');
const { sessionAuth } = require('../middleware/sessionAuth.js');

router.get('/tree', sessionAuth, controller.getAllFolders);

router.get('/:id', sessionAuth, controller.getFolderContents);

router.post('/create', sessionAuth, controller.createFolder);

router.post('/move', sessionAuth, controller.moveItem);

router.post('/rename', async (req, res) => {
  const { type } = req.body;

  if (type === 'folder') return controller.renameFolder(req, res);
  if (type === 'file') return renameFile(req, res);

  req.flash('error', 'Invalid rename type');
  res.redirect('back');
});

router.delete('/delete/:type/:id', sessionAuth, controller.deleteItem);

router.get('/', sessionAuth, controller.getDashboard);

module.exports = router;