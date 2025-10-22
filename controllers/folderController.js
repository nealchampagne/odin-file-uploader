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

module.exports = {
  createFolder,
  listFolders,
  uploadToFolder
}