const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: process.env.CA_CERT,
    rejectUnauthorized: true,
  }
});

module.exports = new PrismaClient({ adapter });