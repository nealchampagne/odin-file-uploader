const prisma = require('../lib/prisma.js');
const passport = require('passport');

const getDashboard = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  try {
    // Get the user's root folder
    const rootFolder = req.session.user.rootFolderId;

    if (!rootFolder) {
      throw new Error('Root folder not found.');
    }

    // Get files in the root folder
    const files = await prisma.file.findMany({
      where: { folderId: rootFolder.id },
      orderBy: { name: 'desc' },
    });

    // Get subfolders of the root folder
    const folders = await prisma.folder.findMany({
      where: { parentId: rootFolder.id },
      orderBy: { name: 'desc' },
    });

    res.render('dashboard', {
      user: req.session.user,
      files,
      folders,
      currentFolder: rootFolder,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('error', { message: 'Failed to load dashboard.' });
  }
};

const getAuthPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth');
};

const postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.render('auth', { error: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      };
      res.redirect('/dashboard');
    });
  })(req, res, next);
};

const getSignupPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('signup');
};

const postNewUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.render('signup', { error: 'Email already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });

    const rootFolder = await prisma.folder.create({
      data: {
        name: 'Root',
        ownerId: newUser.id,
        parentId: null,
      },
    });

    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      rootFolderId: rootFolder.id,
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).render('signup', { error: 'Something went wrong. Try again.' });
  };
};

module.exports = {
  getDashboard,
  getAuthPage,
  postLogin,
  getSignupPage,
  postNewUser,
};