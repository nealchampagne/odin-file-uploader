const prisma = require('./prisma.js');

const getUniqueFileName = async (folderId, ownerId, originalName, excludeId = null) => {
  const extIndex = originalName.lastIndexOf('.');
  const hasExtension = extIndex !== -1;
  const baseName = hasExtension ? originalName.slice(0, extIndex) : originalName;
  const extension = hasExtension ? originalName.slice(extIndex) : '';

  const strippedBase = baseName.replace(/\s\(\d+\)$/, '');
  let finalName = strippedBase + extension;
  let counter = 1;

  while (
    await prisma.file.findFirst({
      where: {
        folderId,
        ownerId,
        name: finalName,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    })
  ) {
    finalName = `${strippedBase} (${counter})${extension}`;
    counter++;
  }

  return finalName;
};

module.exports = {
  getUniqueFileName
}