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

module.exports = {
  getFileById,
  downloadFile,
};