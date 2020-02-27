const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();

const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const uploadCloud = require('../../configs/cloudinary.config');
const Post = require('../../models/Post.model');
const User = require('../../models/User.model');

//user profile
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.get('/user-page', ensureLoggedIn('/auth/login'), (req, res) => {
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
      User.find({}, null, {
        sort: {
          username: 1,
        },
      })
        .then(allUsers => {
          // const uniqUsers = Array.from(new Set(allUsers));
          const uniqUsers = allUsers
            .filter(user => user._id.toString() !== req.user._id.toString())
            .map(user => {
              const { _id, username, firstName, lastName, email, path } = user;
              return {
                _id,
                username,
                firstName,
                lastName,
                email,
                path,
              };
            });
          // console.log('uniqUsers: ', uniqUsers);

          res.render('auth-views/profile', {
            posts: newPosts,
            users: uniqUsers,
            myStyle: '/stylesheets/toggle.css',
          });
        })
        .catch(err => console.log(`Error while looping in User model ${err}`));
    })
    .catch(err => console.log(err));
});

//Get photo upload form
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.get(
  '/user-photo-upload',
  ensureLoggedIn('/auth/login'),
  (req, res, next) => res.render('post-views/photo-upload-form')
);

//POST uploaded photo
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post(
  '/user-photo-upload',
  uploadCloud.single('image'),
  (req, res, next) => {
    User.findByIdAndUpdate(req.user._id, {
      path: req.file.url,
    })
      .then(() => {
        res.redirect('/profile/user-page');
      })
      .catch(err => next(err));
  }
);

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=--=-=
//Get user profile update form
router.get(
  '/profile-update',
  ensureLoggedIn('/auth/login'),
  (req, res, next) => {
    const { firstName, lastName, username, email, _id } = req.user;
    res.render('users/user-profile-update', {
      firstName,
      lastName,
      username,
      email,
    });
  }
);
//POST update user profile
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/profile-update', (req, res, next) => {
  const { user } = req;

  const {
    username,
    firstName,
    lastName,
    email,
    password,
    password1,
    password2,
  } = req.body;

  if (!password || !password1 || !password2) {
    res.render('users/user-profile-update', {
      message: 'Please enter all password inputs!',
      username,
      firstName,
      lastName,
      email,
    });
    return;
  }

  bcrypt
    .compare(password, user.password)
    .then(isMatch => {
      if (!isMatch) {
        res.render('users/user-profile-update', {
          message: 'Incorrect password!',
        });
        return;
      }
      if (password1 !== password2) {
        res.render('users/user-profile-update', {
          message: 'Passwords not match!',
        });
        return;
      }

      bcrypt.hash(password1, 10).then(hashPassword => {
        User.findByIdAndUpdate(user._id, {
          username: username !== '' ? username : user.username,
          firstName: firstName !== '' ? firstName : user.firstName,
          lastName: lastName !== '' ? lastName : user.lastName,
          email: email !== '' ? email : user.email,
          password: hashPassword,
          path: user.path,
        })
          .then(() => {
            res.render('users/user-profile-update', {
              success: 'Thanks!Successfully updated!',
            });
          })
          .catch(err => next(err));
      });
    })
    .catch(err => next(err));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=--=-=
//user details - other user page
router.get('/user-details', (req, res, next) => {
  const { user_id } = req.query;
  console.log('Output for: user_id', user_id);
  const userInSession = req.user;
  User.findById(user_id)
    .populate({
      path: 'friends',
      populate: [{ path: 'userId' }],
    })
    .then(foundOne => {
      if (
        userInSession &&
        userInSession._id.toString() === foundOne._id.toString()
      ) {
        res.redirect('/profile/user-page');
        return;
      }
      if (!userInSession) {
        res.redirect('/auth/login');
      }

      const {
        firstName,
        lastName,
        username,
        email,
        path,
        imageName,
        friends,
      } = foundOne;

      // Retrieve friends from user Schema
      const userFriends = friends.map(eachFriend => {
        const {
          _id,
          firstName,
          lastName,
          username,
          email,
          path,
          imageName,
        } = eachFriend.userId;
        return {
          _id: eachFriend._id,
          userId: _id,
          firstName,
          lastName,
          username,
          email,
          path,
          imageName,
        };
      });
      console.log('userFriends: ', userFriends);

      // Get user posts
      Post.find({creatorId: user_id})
      .then(foundUserPosts => {
        // Get all the users besides yourself from DB
        User.find()
        .then(users => {
          res.render('users/user-details', {
            firstName,
            lastName,
            username,
            email,
            path,
            imageName,
            userFriends,
            posts: foundUserPosts,
            users
          });
          
        })
        .catch(err => console.log(`Error while getting all the users from DB in user-details: ${err}`));
      })
      .catch(err => console.log(`Error while getting all of the user's post: ${err}`))
    })
    .catch(err =>
      console.log(`Error while looking to get user details from DB`)
    );
});

module.exports = router;
