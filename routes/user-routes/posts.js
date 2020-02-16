const express = require('express');
const passport = require('passport');
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const uploadCloud = require('../../configs/cloudinary.config');
const Post = require('../../models/Post.model');
const User = require('../../models/User.model');
const Comment = require('../../models/Comment.model');

//Post from user profile
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.get('/upload-photo', (req, res, next) => {
  res.render('post-views/post-form');
});
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/upload-photo', uploadCloud.single('photo'), (req, res, next) => {
  const { content, picName } = req.body;
  //   creatorId, picPath,
  Post.create({
    content,
    creatorId: req.user._id,
    picPath: req.file.url,
    picName,
  })
    .then(savedPost => {
      //   console.log('savedPost: ', savedPost);
      res.redirect('/profile/user-page'); //goes to index.hbs
    })
    .catch(err => console.log(err));
});

//Get post details
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.get('/post-details', (req, res, next) => {
  //post_id coming from index.hbs, from each each post detail (a tag)
  const { post_id } = req.query;
  Post.findById(post_id)
    .populate('creatorId')
    .then(foundOne => {
      //   console.log('foundOne: ', foundOne);
      let newObj;
      const { _id, content, creatorId, picPath, picName } = foundOne;
      if (req.user && req.user._id.toString() === creatorId._id.toString()) {
        newObj = {
          postId: _id,
          picPath,
          picName,
          content,
          userId: creatorId._id,
          username: creatorId.username,
          userEmail: creatorId.email,
          userImg: creatorId.path,
          isCreator: true,
        };
      } else {
        newObj = {
          postId: _id,
          picPath,
          picName,
          content,
          userId: creatorId._id,
          username: creatorId.username,
          userEmail: creatorId.email,
          userImg: creatorId.path,
        };
      }

      res.render('post-views/post-details', newObj);
    })
    .catch(err => console.log(err));
});

//Delete post
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
router.post('/delete-post', (req, res, next) => {
  const { url } = req;
  console.log('Output for: url', url);
  Post.findByIdAndDelete(req.query.post_id)
    .then(post => {
      console.log(`Post with ${post._id} is deleted`);
      res.redirect('/');
    })
    .catch(err => next(err));
});

module.exports = router;

// //just getting uniq user which belongs to the post
// Post.find({})
//   .populate('authorId')
//   .then(posts => {
//     const allPosts = posts
//       .filter(post => {
//         return post.postId.toString() === post_id.toString(); // == because one is string and the other is a number, they are 2 diff types
//       }) //map is to filter out hash password from every author
//       .map(post => {
//         const { _id, content, creatorId } = post;
//         if (req.user) {
//           if (creatorId._id.toString() === req.user._id.toString()) {
//             return {
//               _id,
//               content,
//               username: creatorId.username,
//               creatorId: creatorId._id,
//               userImage: creatorId.path,
//               currentUserId: req.user._id,
//             };
//           }
//         }
//         return {
//           _id,
//           content,
//           username: creatorId.username,
//           creatorId: creatorId._id,
//           userImage: creatorId.path,
//         };
//       });

//     if (allPosts.length === 0) {
//       res.render('post-views/post-details', {
//         message: "There's no Posts",
//       });
//       return;
//     }
//   });
