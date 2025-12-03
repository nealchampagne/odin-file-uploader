const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('node:fs');
const path = require('node:path');

const caCertPath = process.env.CA_CERT_PATH;
const caCert = fs.readFileSync(caCertPath, 'utf-8');

console.log('Using CA cert from:', caCertPath);
console.log('CA_CERT length:', caCert.length, 'characters loaded');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: caCert,
    rejectUnauthorized: true,
  }
});

module.exports = new PrismaClient({ adapter });