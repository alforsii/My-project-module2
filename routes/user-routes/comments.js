const express = require('express');
const passport = require('passport');
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const uploadCloud = require('../../configs/cloudinary.config');
const Post = require('../../models/Post.model');
const User = require('../../models/User.model');
const Comment = require('../../models/Comment.model');

//Create comments - POST
// -=-=-=-=-=-=-=-=--=-=-=-=--=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-
router.post('/post-details', (req, res, next) => {
  const user = req.user;
  const { post_id } = req.query;
  Post.findById(post_id)
    .populate('creatorId')
    .then(foundOne => {
      //   console.log('foundOne: ', foundOne);
      const { _id, content, creatorId, picPath, picName } = foundOne;
      const newObj = {
        postId: _id,
        picPath,
        picName,
        content,
        userId: creatorId._id,
        username: creatorId.username,
        userEmail: creatorId.email,
        userImg: creatorId.path,
      };

      if (!user) {
        res.render('post-views/post-details', {
          ...newObj,
          message: 'Please sign in to add comments',
        });
        return;
      }

      const { comment } = req.body;
      Comment.create({
        content: comment, //here I just add comment
        authorId: user._id, //authorId to know who commented
        postId: post_id, //postId we need to separate each post comments
        imgPath: user.path, //for imgPath I add author image
        imageName: user.imageName, //author image name
      })
        .then(commentFromDB => {
          console.log('Comment created: ', commentFromDB);
          res.redirect('back');
        })
        .catch(err =>
          console.log(`Error while trying to create comments ${err}`)
        );
    })
    .catch(err => console.log(err));
});

//Post comments - Get
// -=-=-=-=-=-=-=-=--=-=-=-=--=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-
router.get('/post-details/comments', (req, res, next) => {
  const { post_id } = req.query;
  //   Comment.findOne({ postId: post_id })
  Comment.find({})
    .populate('authorId')
    .then(comments => {
      const allComments = comments
        .filter(comment => {
          return comment.postId.toString() === post_id.toString(); // == because one is string and the other is a number, they are 2 diff types
        }) //map is to filter out hash password from every author
        .map(comment => {
          const { _id, content, authorId } = comment;
          if (req.user) {
            if (authorId._id.toString() === req.user._id.toString()) {
              return {
                _id,
                content,
                username: authorId.username,
                authorId: authorId._id,
                userImage: authorId.path,
                // currentUserId: req.user._id,
                isAuthor: true,
              };
            }
          }
          return {
            _id,
            content,
            username: authorId.username,
            authorId: authorId._id,
            userImage: authorId.path,
          };
        });

      if (allComments.length === 0) {
        res.render('post-views/post-comments', {
          message: "There's no comments",
        });
        return;
      }

      console.log('filtered comments: ', allComments);
      res.render('post-views/post-comments', { allComments });
    })
    .catch(err => console.log(`Error while getting comments from DB ${err}`));
});

//Post deleted comments
// -=-=-=-=-=-=-=-=--=-=-=-=--=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-
router.post('/delete-comment', (req, res, next) => {
  const { comment_id } = req.query;
  Comment.findByIdAndDelete(comment_id)
    .then(() => res.redirect('back'))
    .catch(err => next(err));
});

module.exports = router;
