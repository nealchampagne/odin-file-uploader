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
  const userId = req.user.id;
  const { folderId } = req.body;
  const file = req.file;

  if (!folderId || !file) {
    return res.status(400).send("Missing folder or file");
  }

  // Optional: validate folder ownership
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder || folder.ownerId !== userId) {
    return res.status(403).send("Invalid folder");
  }

  console.log(`Uploading ${file.originalname} (${file.size} bytes) to folder ${req.body.folderId}`);

  await prisma.file.create({
    data: {
      name: file.originalname,
      ownerId: userId,
      folderId,
      size: file.size,
      mimeType: file.mimetype,
      url: file.path,
      // Add metadata if needed
    }
  });

  res.redirect(`/folders/${folderId}`);
};

module.exports = {
  getFileById,
  downloadFile,
  uploadFile,
};