var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Product = require('../models/Product');
var Course = require('../models/Course');
const mail = require('../config/mail');
const dot = require('../config/dot');
const sms = require('../config/sms');
const timedigit = require('../config/timedigit');
const { productCategories, coursetypes, courseCategories } = require('../config/consts');
const Blogpost = require('../models/Blogpost');
const dateConvert = require('../config/dateConvert');

router.get('/', (req, res, next) => {
    Blogpost.find({}, (err, blogposts) => {
        res.render('./blog/blog-posts', {
            theme: req.session.theme,
            user: req.user,
            blogposts,
            dateConvert,
        })
    });
});
router.get('/blog-view', (req, res, next) => {
    var blogpostID = req.query.id;
    Blogpost.find({}, (err, blogposts) => {
        Blogpost.findById(blogpostID, (err, blogpost) => {
            res.render('./blog/blog-view', {
                theme: req.session.theme,
                user: req.user,
                blogposts,
                blogpost,
            });
        });
    });
});

module.exports = router;
