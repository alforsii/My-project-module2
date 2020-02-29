const express = require('express');
const passport = require('passport');
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

router.get('/', ensureLoggedOut(), (req, res) => {
  res.render('welcome-page', { message: req.flash('error') });
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



module.exports = router;
