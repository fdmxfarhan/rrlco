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
router.get('/blog-edit', ensureAuthenticated, (req, res, next) => {
    if(req.user.role != 'admin'){
        res.send('دسترسی مجاز نیست!!');
        return;
    }
    var blogpostID = req.query.id;
    Blogpost.find({}, (err, blogposts) => {
        Blogpost.findById(blogpostID, (err, blogpost) => {
            res.render('./blog/blog-edit', {
                theme: req.session.theme,
                user: req.user,
                blogposts,
                blogpost,
            });
        });
    });
});
router.post('/update-post', ensureAuthenticated, (req, res, next) => {
    if(req.user.role != 'admin'){
        res.send('دسترسی مجاز نیست!!');
        return;
    }
    var {blogpostID, content} = req.body;
    Blogpost.updateMany({_id: blogpostID}, {$set: {content}}, (err, doc) => {
        req.flash('success_msg', 'تغییرات ثبت شد');
        res.redirect(`/blog/blog-view?id=${blogpostID}`);
    })
});


module.exports = router;
