const express = require('express');
const passport = require('passport');
const router = express.Router();
const Post = require('../../models/Post.model');
const User = require('../../models/User.model');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

router.get('/login', ensureLoggedOut(), (req, res) => {
  res.render('auth-views/login', { message: req.flash('error') });
});

router.post(
  '/login',
  ensureLoggedOut(),
  passport.authenticate('local-login', {
    successRedirect: '/profile/user-page',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
);

router.get('/signup', ensureLoggedOut(), (req, res) => {
  res.render('auth-views/signup', { message: req.flash('error') });
});

router.post(
  '/signup',
  ensureLoggedOut(),
  passport.authenticate('local-signup', {
    successRedirect: '/profile/user-page',
    failureRedirect: '/auth/signup',
    failureFlash: true,
  })
);

router.post('/logout', ensureLoggedIn('/login'), (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
