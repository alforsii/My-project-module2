const express = require('express');
const passport = require('passport');
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const uploadCloud = require('../../configs/cloudinary.config');
const Post = require('../../models/Post.model');
const User = require('../../models/User.model');
const Comment = require('../../models/Comment.model');
const Album = require('../../models/Album.model');
const Image = require('../../models/Image.model');

//Get photo to albums page
router.get('/photo-albums', (req, res, next) => {
  Album.find({ author: req.user._id })
    .then(albumsFromDB => {
      // console.log('albumFromDB: ', albumFromDB);
      res.render('users/albums.hbs', { albums: albumsFromDB });
    })
    .catch(err => console.log(`Error while getting all albums ${err}`));
});
//Create album
router.get('/create-album', (req, res, next) => {
  res.render('users/create-album.hbs');
});
//Post photo to albums
router.post('/create-album', (req, res, next) => {
  const { name } = req.body;
  Album.create({ name, author: req.user._id })
    .then(newlyCreatedAlbum => {
      console.log('newlyCreatedAlbum: ', newlyCreatedAlbum);
      res.redirect('/posts/photo-albums');
    })
    .catch(err => console.log(`Error while creating a new Album ${err}`));
});
// Album page
router.get('/album', (req, res, next) => {
  const { album_id } = req.query;
  if (album_id !== undefined) {
    console.log('Output for: album_id', album_id);
    //get images
    Image.find({ author: req.user._id, album: album_id })
      .then(imagesFromDB => {
        //get albums
        Album.find({ author: req.user._id })
          .then(albumsFromDB => {
            // console.log('albumFromDB: ', albumFromDB);
            const filerOutCurrentAlbum = albumsFromDB.filter(
              album => album._id.toString() !== album_id.toString()
            );
            res.render('users/album.hbs', {
              images: imagesFromDB,
              album_id,
              albums: filerOutCurrentAlbum,
            });
          })
          .catch(err => console.log(`Error while getting all albums ${err}`));
      })
      .catch(err => console.log(`Error finding images ${err}`));
    // console.log(album_id);
  } else res.render('users/album.hbs');
});
//Get add image form
router.get('/album/add-image', (req, res, next) => {
  const { album_id } = req.query;
  console.log('album_id: ', album_id);
  res.render('users/add-image-form.hbs', { album_id });
});
//Post image(add)
router.post(
  '/album/add-image',
  uploadCloud.single('image'),
  (req, res, next) => {
    const { name, description } = req.body;
    const { album_id } = req.query;
    // console.log({ file: req.file, body: req.body });

    Image.create({
      name,
      description,
      path: req.file.url,
      author: req.user._id,
      album: album_id,
    })
      .then(savedImage => {
        console.log('savedImage: ', savedImage);
        res.redirect(`/posts/album?album_id=${album_id}`);
      })
      .catch(err => console.log(`Error while creating image ${err}`));
  }
);
//Post from user profile
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.get('/upload-photo', (req, res, next) => {
  res.render('post-views/post-form');
});
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/upload-photo', uploadCloud.single('photo'), (req, res, next) => {
  const { content, picName } = req.body;
  //   creatorId, picPath,
  console.log(req.file);
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
      const { _id, content, creatorId, picPath, picName } = foundOne;
      const newObj = {
        postId: _id,
        picPath,
        picName,
        content,
        firstName: creatorId.firstName,
        userId: creatorId._id,
        username: creatorId.username,
        userEmail: creatorId.email,
        userImg: creatorId.path,
        isCreator: true,
      };

      if (req.user && req.user._id.toString() === creatorId._id.toString()) {
        newObj.isCreator = true;
      } else {
        newObj.isCreator = false;
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
      res.redirect('/profile/user-page');
    })
    .catch(err => next(err));
});

module.exports = router;
