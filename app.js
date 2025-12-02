const express = require('express');
const session = require('express-session');
require('dotenv').config();
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require('./lib/prisma.js');
const supabase = require('./lib/supabase.js');
const passport = require('passport');
require('./auth.js');
const fs = require('node:fs');
const path = require('node:path');
const PORT = process.env.PORT || 3000;
const flash = require('connect-flash');

// Ensure CA cert is available for secure DB connections
const caCertPath = path.join(__dirname, 'temp-ca.pem');
fs.writeFileSync(caCertPath, process.env.CA_CERT);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, // prune expired sessions every 2 minutes
  }),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false, // true in production with HTTPS
    httpOnly: true,
  }
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use((req, res, next) => {
  console.log('Session:', req.session);
  next();
});

// Routes
app.use('/folders', require('./routes/folders.js'));
app.use('/files', require('./routes/files.js'));
app.use('/share', require('./routes/share.js'));
app.use('/', require('./routes/auth.js'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
