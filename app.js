const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./auth.js');
const path = require('node:path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/folders', require('./routes/folders.js'));
app.use('/files', require('./routes/files.js'));
app.use('/share', require('./routes/share.js'));
app.use('/', require('./routes/dashboard.js'));

module.exports = app;
