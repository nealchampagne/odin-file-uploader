const prisma = require('../lib/prisma.js');

const shareFolder = async (req, res) => {
  const folderId = req.params.folderId;
  if (!folderId) return res.status(400).json({ error: 'Missing folderId parameter' });

  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) return res.status(404).json({ error: 'Folder not found' });
  if (folder.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!req.body.duration) {
    return res.status(400).json({ error: 'Missing duration for share link' });
  }

  const durationMs = parseDuration(req.body.duration);
  const maxDurationMs = 30 * 24 * 60 * 60 * 1000;
  if (durationMs > maxDurationMs) {
    return res.status(400).json({ error: 'Share duration exceeds limit' });
  }

  const expiresAt = new Date(Date.now() + durationMs);
  const shared = await prisma.sharedFolder.create({
    data: { folderId, expiresAt },
  });

  const host = req.get('host');
  res.json({ link: `https://${host}/share/${shared.id}` });
};

const getSharedFolder = async (req, res) => {
  const shareId = req.params.id;
  if (!shareId) return res.status(400).json({ error: 'Missing share ID' });

  const shared = await primsa.sharedFolder.findUnique({
    where: { id: shareId },
    include: { folder: true},
  });

  if (!shared) return res.status(404).json({ error: 'Share link not found' });

  if (share.expiresAt < new Date()) {
    return res.status(410).json({ error: 'Share link expired'});
  }

  const files = await primsa.file.findMany({
    where: { folderId: shared.folderId },
    select: { id: true, name: true, size: true, mimeType: true, createdAt: true },
  });

  res.json({
    folder: { name: shared.folder.name },
    expiresAt: shared.expiresAt,
    files,
  });
};

module.exports = {
  shareFolder,
  getSharedFolder,
};
