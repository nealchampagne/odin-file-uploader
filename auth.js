const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(new LocalStrategy(async (email, password, done) => {
  const user = await prisma.userfandUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) return done(null, false);
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: {id} });
  done(null, user);
})