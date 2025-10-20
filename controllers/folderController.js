const prisma = require('../lib/prisma.js');

const createFolder = async (req, res) => {
  const folder = await prisma.folder.create({
    data: { name: req.body.name, ownerId: req.user.id },
  });
  res.json(folder);
};

const listFolders = async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { ownerId: req.user.id },
  });
  res.json(folders);
};

const uploadToFolder = async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: { id: req.params.id },
  });

  if (!folder || folder.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Invalid folder or access denied' });
  }

  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const file = await prisma.file.create({
    data: {
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      url: req.file.path,
      folderId: req.params.id,
      ownerId: req.user.id,
    },
  });
  
  res.json(file);
}

module.exports = {
  createFolder,
  listFolders,
  uploadToFolder
}