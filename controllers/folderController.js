const prisma = require('../lib/prisma.js');
const { getFolderView, buildFolderPaths } = require('../lib/folderView.js');

const getAvailableFolderName = async (baseName, parentId, userId) => {
  const existingFolders = await prisma.folder.findMany({
    where: {
      parentId,
      ownerId: userId,
      name: { startsWith: baseName }
    },
    select: { name: true }
  });

  const names = existingFolders.map(f => f.name);
  if (!names.includes(baseName)) return baseName;

  let suffix = 1;
  let candidate;
  do {
    candidate = `${baseName} (${suffix})`;
    suffix++;
  } while (names.includes(candidate));

  return candidate;
}

const createFolder = async (req, res) => {
  const userId = req.session.user.id;
  const parentId = req.body.parentId || null;

  try {
    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId }
      });

      if (!parentFolder || parentFolder.ownerId !== userId) {
        return res.status(403).send("Access denied or invalid parent folder");
      }
    }

    const name = await getAvailableFolderName("New Folder", parentId, userId);

    await prisma.folder.create({
      data: {
        name,
        ownerId: userId,
        parentId
      }
    });

    // Redirect based on context
    if (parentId === null) {
      res.redirect("/dashboard");
    } else {
      res.redirect(`/folders/${parentId}`);
    }
  } catch (err) {
    console.error("Error creating folder:", err);
    res.status(500).send("Something went wrong");
  }
};

// GET /folders/:id
const getFolderContents = async (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;

  // Get all folders for dropdown
  const allUserFolders = await prisma.folder.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true, parentId: true }
  });

  // Build full paths for dropdown
  const folderPaths = buildFolderPaths(allUserFolders);

  try {
    const viewData = await getFolderView(folderId, userId);
    res.render("folder", { ...viewData, folderPaths });
  } catch (err) {
    res.status(404).send(err.message);
  }
};

const getDashboard = async (req, res) => {
  const userId = req.session.user.id;

  const rootFolderId = req.session.user.rootFolderId;

  console.log('Session user:', req.session.user);

  // Get all folders for dropdown
  const allUserFolders = await prisma.folder.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true, parentId: true }
  });

  // Build full paths for dropdown
  const folderPaths = buildFolderPaths(allUserFolders);

  if (!rootFolderId) return res.status(404).send("Root folder not found");

  try {
    const viewData = await getFolderView(rootFolderId, userId);
    const isRoot = !viewData.parentId;
    res.render("folder", { ...viewData, isRoot, folderPaths });
  } catch (err) {
    res.status(404).send(err.message);
  }
};



module.exports = {
  createFolder,
  getDashboard,
  getFolderContents,
}