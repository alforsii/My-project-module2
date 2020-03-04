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
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/photo-albums', ensureLoggedIn('/auth/login'), (req, res, next) => {
  Album.find({ author: req.user._id })
    .populate('images')
    .then(albumsFromDB => {
      // console.log('albumFromDB: ', albumFromDB);
      res.render('users/albums.hbs', { albums: albumsFromDB });
    })
    .catch(err => console.log(`Error while getting all albums ${err}`));
});

//Create album
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/create-album', ensureLoggedIn('/auth/login'), (req, res, next) => {
  res.render('users/create-album.hbs');
});

//Post photo to albums
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post('/create-album', (req, res, next) => {
  const { name } = req.body;
  Album.create({ name, author: req.user._id })
    .then(newlyCreatedAlbum => {
      // console.log('newlyCreatedAlbum: ', newlyCreatedAlbum);
      res.redirect('/posts/photo-albums');
    })
    .catch(err => console.log(`Error while creating a new Album ${err}`));
});

// Album page
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/album', ensureLoggedIn('/auth/login'), (req, res, next) => {
  const { album_id } = req.query;
  if (album_id !== undefined) {
    // console.log('Output for: album_id', album_id);
    //1.Get current album
    //2.Get All the images for selected album userAlbum[0].images
    Album.find({ _id: album_id })
      .populate('images') //this is current album images
      .populate('author') //author of the album
      .then(userAlbum => {
        //3.Get all albums that has the same user (with selected album) for display on the same page as an option
        Album.find({ author: userAlbum[0].author })
          .populate('images') //here we need just min 4 images for each album folder for cover
          .then(allUserAlbums => {
            // console.log('allUserAlbums: ', allUserAlbums);
            //4.Filter out current album to display all other albums, when you're in current album page
            const filerOutCurrentAlbum = allUserAlbums.filter(
              album => album._id.toString() !== album_id.toString()
            );
            //5.Let's check the name for other albums to whom belong(if it's current(me) user then let's display 'Your other albums', if other user we'll display the name of user,example: "Adam's other albums")
            const authorOfAlbums =
              userAlbum[0].author._id.toString() === req.user._id.toString()
                ? 'Your'
                : `${userAlbum[0].author.firstName}'s`;
            res.render('users/album.hbs', {
              album_id,
              albumName: userAlbum[0].name,
              author: authorOfAlbums,
              isMyAlbum: authorOfAlbums === 'Your' ? true : false,
              images: userAlbum[0].images,
              albums: filerOutCurrentAlbum,
            });
          })
          .catch(err =>
            console.log(`Error while getting all albums for user ${err}`)
          );
      })
      .catch(err => console.log(`Error while getting user album ${err}`));
  } else res.render('users/album.hbs');
});

//Get add image form
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get(
  '/album/add-image',
  ensureLoggedIn('/auth/login'),
  (req, res, next) => {
    const { album_id } = req.query;
    console.log('album_id: ', album_id);
    res.render('users/add-image-form.hbs', { album_id });
  }
);

//Post image(add)
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post(
  '/album/add-image',
  uploadCloud.single('image'),
  (req, res, next) => {
    const { name, description } = req.body;
    const { album_id } = req.query;
    // console.log({ file: req.file, body: req.body });
    //1.Create a new image
    Image.create({
      name,
      description,
      path: req.file.url,
      author: req.user._id,
      album: album_id,
    })
      .then(newlyCreatedImage => {
        // 2. Update - add newlyCreatedImage._id to the album.images
        Album.findByIdAndUpdate(
          { _id: album_id },
          { $push: { images: newlyCreatedImage._id } },
          { new: true }
        )
          .then(updatedAlbum => {
            // console.log('updatedAlbum: ', updatedAlbum);
            //3.Redirect back to the album with images page
            res.redirect(`/posts/album?album_id=${updatedAlbum._id}`);
          })
          .catch(err =>
            console.log(`Error while updating images in user Album ${err}`)
          );
      })
      .catch(err => console.log(`Error while creating image ${err}`));
  }
);

//Delete Album
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/delete-album', (req, res, next) => {
  const { album_id } = req.query;
  //1.get the album (we could delete right away but we want to delete all images that this album has since we're deleting the album there's no use of those images that belong to this album)
  Album.findById(album_id)
    .then(albumFromDB => {
      console.log('albumFromDB: ', albumFromDB);
      //2.Delete all images for this album from Image.model(images collection)from DB
      Image.deleteMany({ _id: { $in: albumFromDB.images } })
        .then(imagesDeleted => {
          console.log(imagesDeleted);
          //3.Now delete Album
          Album.findByIdAndRemove(album_id)
            .then(deletedAlbum => {
              // console.log('deletedAlbum: ', deletedAlbum);
              res.redirect('/posts/photo-albums');
            })
            .catch(err =>
              console.log(
                `Error while deleting Album after all images deleted ${err}`
              )
            );
        })
        .catch(err =>
          console.log(
            `Error while deleting all images before album deletion ${err}`
          )
        );
    })
    .catch(err =>
      console.log(`Error while looking for album for deletion ${err}`)
    );
});

//Delete image from album
router.post('/delete-image', (req, res, next) => {
  const { image_id } = req.query;
  //1.Find image by id and delete
  Image.findByIdAndDelete(image_id)
    .then(deletedImage => {
      //2. Remove the deleted image id from Albums images array in DB
      Album.findOneAndUpdate(
        { _id: deletedImage.album },
        { $pull: { images: deletedImage._id } }
      )
        .then(updatedAlbum => {
          console.log('updated album', updatedAlbum);
          res.redirect(`/posts/album?album_id=${deletedImage.album}`);
        })
        .catch(err =>
          console.log(`Error while updating Album for deleted image ${err}`)
        );
    })
    .catch(err => console.log(`Error while deleting image ${err}`));
});

//Post from user profile
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.get('/upload-photo', ensureLoggedIn('/auth/login'), (req, res, next) => {
  res.render('post-views/post-form');
});
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/upload-photo', uploadCloud.single('photo'), (req, res, next) => {
  const { content, picName } = req.body;
  //   author, picPath,
  // console.log(req.file);
  Post.create({
    content,
    author: req.user._id,
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
router.get('/post-details', ensureLoggedIn('/auth/login'), (req, res, next) => {
  //post_id coming from index.hbs, from each each post detail (a tag)
  const { post_id } = req.query;
  Post.findById(post_id)
    .populate('author')
    .then(foundOne => {
      //   console.log('foundOne: ', foundOne);
      const { _id, content, author, picPath, picName } = foundOne;
      const newObj = {
        postId: _id,
        picPath,
        picName,
        content,
        firstName: author.firstName,
        userId: author._id,
        username: author.username,
        userEmail: author.email,
        userImg: author.path,
        // isCreator: true,
      };

      if (req.user && req.user._id.toString() === author._id.toString()) {
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
  // console.log('Output for: url', url);
  Post.findByIdAndDelete(req.query.post_id)
    .then(post => {
      // console.log(`Post with ${post._id} is deleted`);
      res.redirect('/profile/user-page');
    })
    .catch(err => next(err));
});

module.exports = router;
