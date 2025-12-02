const prisma = require('../lib/prisma.js');

const shareFolder = async (req, res) => {
  const { folderId } = req.params;
  const { expiresInDays = 7 } = req.body;

  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Confirm folder exists and belongs to user
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder || folder.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const shareId = folderId; // reuse folderId for deterministic URL if desired
    const shareUrl = `/share/${shareId}`;
    const expiresAt = new Date(Date.now() + expiresInDays * 86400000);

    const shared = await prisma.sharedFolder.upsert({
      where: { folderId },
      update: { url: shareUrl, expiresAt },
      create: { folderId, url: shareUrl, expiresAt },
    });

    res.status(201).json({ url: shared.url, expiresAt: shared.expiresAt });
  } catch (err) {
    console.error('Share error:', err);
    res.status(500).json({ error: 'Failed to share folder' });
  }
};

const getFolderTreeWithFiles = async (folderId) => {
  const folders = await prisma.folder.findMany({ where: { parentId: folderId } });
  const files = await prisma.file.findMany({ where: { folderId } });

  const children = await Promise.all(
    folders.map(async (f) => await getFolderTreeWithFiles(f.id))
  );

  return {
    id: folderId,
    files,
    children,
  };
};

const getSharedFolderById = async (req, res) => {
  const { folderId } = req.params;

  try {
    // Resolve shared access by walking up the folder tree
    const resolveSharedAccess = async (targetId) => {
      let currentId = targetId;

      while (currentId) {
        const shared = await prisma.sharedFolder.findFirst({
          where: {
            folderId: currentId,
            expiresAt: { gt: new Date() },
          },
        });

        if (shared) return shared;

        const folder = await prisma.folder.findUnique({ where: { id: currentId } });
        currentId = folder?.parentId || null;
      }

      return null;
    };

    const shared = await resolveSharedAccess(folderId);
    if (!shared) {
      return res.status(403).render('error', { message: 'Access denied.' });
    } else if (new Date() > shared.expiresAt) {
      return res.status(403).render('error', { message: 'Share expired.'});
    }

    // Load folder contents
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    const files = await prisma.file.findMany({ where: { folderId } });
    const subfolders = await prisma.folder.findMany({ where: { parentId: folderId } });

    // Build breadcrumbs from shared root to current folder
    const getBreadcrumbPath = async (sharedRootId, targetId) => {
      const path = [];
      let currentId = targetId;

      while (currentId && currentId !== sharedRootId) {
        const f = await prisma.folder.findUnique({ where: { id: currentId } });
        if (!f) break;
        path.unshift({ id: f.id, name: f.name });
        currentId = f.parentId;
      }

      const root = await prisma.folder.findUnique({ where: { id: sharedRootId } });
      path.unshift({ id: root.id, name: root.name === 'Root' ? 'Home' : root.name });

      return path;
    };

    const breadcrumbs = await getBreadcrumbPath(shared.folderId, folderId);

    // Render the shared folder view
    res.render('folder', {
      folder,
      folderId: folder.id,
      folderName: folder.name,
      files,
      subfolders,
      breadcrumbs,
      sharedContext: true,
      sharedFolderId: shared.id,
      expiresAt: shared.expiresAt,
    });
  } catch (err) {
    console.error('Shared folder access error:', err);
    res.status(500).render('error', { message: 'Failed to load shared folder.' });
  }
};

module.exports = {
  shareFolder,
  getSharedFolderById,
};
