const prisma = require('./prisma');
const { naturalSortByName } = require('./sort');

const getBreadcrumbTrail = async (folder) => {
  const trail = [];
  let current = folder;

  while (current && current.parentId) {
    trail.unshift({ id: current.id, name: current.name });

    if (!current.parentId) break;

    current = await prisma.folder.findUnique({
      where: { id: current.parentId },
      select: { id: true, name: true, parentId: true }
    });
  }

  // Prepend "Home" (root folder)
  trail.unshift({ id: null, name: "Home" });

  return trail;
}

const buildFolderPaths = (folders) => {
  const folderMap = new Map();
  folders.forEach(f => folderMap.set(f.id, f));

  return folders.map(folder => {
    let path = folder.name;
    let current = folderMap.get(folder.parentId);

    while (current) {
      path = `${current.name} > ${path}`;
      current = folderMap.get(current.parentId);
    }

    return { id: folder.id, path };
  });
};

// Fetches folder contents for a given folder ID and user.

const getFolderView = async (folderId, userId) => {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      subfolders: { where: { ownerId: userId } },
      files: { where: { ownerId: userId } },
      parent: true
    }
  });

  if (!folder || folder.ownerId !== userId) {
    throw new Error("Folder not found or access denied");
  }

  const breadcrumbs = await getBreadcrumbTrail(folder);
  
  return {
    folderId: folder.id,
    folderName: folder.name,
    parentId: folder.parentId,
    subfolders: naturalSortByName(folder.subfolders),
    files: naturalSortByName(folder.files),
    breadcrumbs
  };
}

module.exports = {
  getFolderView,
  buildFolderPaths,
};