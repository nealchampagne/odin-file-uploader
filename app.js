const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./auth.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

// Routes
app.use('/folders', require('./routes/folders.js'));
app.use('/files', require('./routes/files.js'));
app.use('/share', require('./routes/share.js'))

module.exports = app;
