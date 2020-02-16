const express = require('express');
const passport = require('passport');
const router = express.Router();
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

router.get('/login', ensureLoggedOut(), (req, res) => {
  res.render('authentication/login', { message: req.flash('error') });
});

router.post(
  '/login',
  ensureLoggedOut(),
  passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

router.get('/signup', ensureLoggedOut(), (req, res) => {
  res.render('authentication/signup', { message: req.flash('error') });
});

router.post(
  '/signup',
  ensureLoggedOut(),
  passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true,
  })
);

//user profile
router.get('/profile', ensureLoggedIn('/login'), (req, res) => {
  Post.find()
    .populate('creatorId')
    .then(posts => {
      //Take out authors password(not to send to the front end, so no one can see)
      const newPosts = posts.map(post => {
        let { _id, content, picPath, picName } = post;
        let { username, firstName, lastName, email, path } = post.creatorId;
        let newPost = {
          _id,
          content,
          picPath,
          picName,
          userId: post.creatorId._id,
          username,
          firstName,
          lastName,
          email,
          path,
        };
        return newPost;
      });

      //Sort Users by username and Get Uniq Users to display
      User.find({}, null, { sort: { username: 1 } })
        .then(allUsers => {
          // const uniqUsers = Array.from(new Set(allUsers));
          const uniqUsers = allUsers
            .filter(user => user._id.toString() !== req.user._id.toString())
            .map(user => {
              const { _id, username, path } = user;
              return { _id, username, path };
            });
          // console.log('uniqUsers: ', uniqUsers);

          res.render('authentication/profile', {
            posts: newPosts,
            users: uniqUsers,
          });
        })
        .catch(err => console.log(`Error while looping in User model ${err}`));
    })
    .catch(err => console.log(err));
});

router.post('/logout', ensureLoggedIn('/login'), (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
