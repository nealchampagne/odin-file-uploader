const prisma = require('../lib/prisma.js');

const getFileById = async (req, res) => {
  
  const file = await prisma.file.findUnique({ where: { id: req.params.id } });
  
  if (!file) return res.status(404).json({ error: 'File not found' });
  
  res.json({ name: file.name, size: file.size, uploaded: file.createdAt });
};

const downloadFile = async (req, res) => {
  
  const file = await prisma.file.findUnique({ where: { id: req.params.id } });
  
  if (!file) return res.status(404).json({ error: 'File not found' });
  
  res.setHeader('Content-Type', file.mimeType);
  res.download(file.url, file.name);
};

const uploadFile = async (req, res) => {

  const { file, title, folderId } = req.body;
  const targetFolderId = folderId || req.session.user.rootFolderId;

  const folder = await prisma.folder.findUnique({
    where: { id: targetFolderId },
  });

  if (!folder || folder.ownerId !== req.session.user.id) {
    return res.status(403).json({ error: 'Invalid folder selection' });
  }

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  await prisma.file.create({
    data: {
      name: title || file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      url: file.path,
      folderId: targetFolderId,
      ownerId: req.session.user.id,
    },
  });

  console.log(`User ${req.session.user.email} uploaded ${file.originalname} to folder ${targetFolderId}`);

  res.json({
    name: title || file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    folderId: targetFolderId,
    uploadedAt: new Date(),
  });
}

module.exports = {
  getFileById,
  downloadFile,
  uploadFile,
};