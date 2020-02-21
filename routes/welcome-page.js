const express = require('express');
const router = express.Router();

const Post = require('../models/Post.model');

/* GET home page. */
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.get('/', (req, res) => {
  Post.find()
    .then(posts => {
      res.render('welcome-page', { title: 'Posts', posts });
    })
    .catch(err => console.log(err));
});



module.exports = router;
