const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const caCert = process.env.CA_CERT.replace(/\\n/g, '\n')

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: caCert,
    rejectUnauthorized: true,
  }
});


module.exports = new PrismaClient({ adapter });