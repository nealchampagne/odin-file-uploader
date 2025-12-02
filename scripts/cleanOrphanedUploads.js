const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma.js');
const uploadsDir = path.join(__dirname, '..', 'uploads');

(async () => {
  try {
    const dbFiles = await prisma.file.findMany();
    const dbFilenames = new Set(dbFiles.map(f => path.basename(f.url)));

    const filesOnDisk = fs.readdirSync(uploadsDir);
    const orphaned = filesOnDisk.filter(f => !dbFilenames.has(f));

    if (orphaned.length === 0) {
      console.log('✅ No orphaned files found.');
      return;
    }

    console.log(`🧹 Deleting ${orphaned.length} orphaned file(s):`);
    orphaned.forEach(f => {
      const fullPath = path.join(uploadsDir, f);
      fs.unlinkSync(fullPath);
      console.log(`  - Deleted: ${f}`);
    });

    console.log('✅ Cleanup complete.');
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
