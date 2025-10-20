const prisma = require('../lib/prisma.js');

const shareFolder = async (req, res) => {
  const expiresAt = new Date(Date.now() + parseDuration(req.body.duration));
  const shared = await prisma.sharedFolder.create({
    data: { folderId: req. params.folderId, expiresAt },
  });
  // Edit url to the real one
  res.json({ link: 'https://yourapp.com/share/${shared.id}' });
};

module.exports = {
  shareFolder
};