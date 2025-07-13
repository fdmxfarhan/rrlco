var express = require('express');
var router = express.Router();
var path = require('path');

var User = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');
const { homedir } = require('os');
const Product = require('../models/Product');
const Course = require('../models/Course');
const dot = require('../config/dot');
const timedigit = require('../config/timedigit');


// User.find({role: 'user'}, (err, users) => {
//     console.log(users)
//     for(var i=0; i<users.length; i++){
//         console.log(users[i].courses)
//     }
// })

router.get('/', (req, res, next) => {
    var {lang} = req.query;
    if(lang) req.session.lang = lang;
    if(!req.session.lang)     req.session.lang = 'FA';
    if(!req.session.theme)     req.session.theme = 'light';
    if(req.session.lang == 'EN'){
        res.render('home',{
            theme: req.session.theme,
            lang: req.session.lang,
            user: req.user
        });
    }
    
    else if(req.session.lang == 'FA'){
        Product.find({showHome: true}, (err, products) => {
            Product.find({}, (err, allProducts) => {
                Course.find({}, (err, courses) => {
                    products.sort((a, b) => b.weight - a.weight);
                    courses.reverse()
                    res.render('home-fa',{
                        theme: req.session.theme,
                        lang: req.session.lang,
                        user: req.user,
                        products,
                        courses,
                        dot,
                        timedigit,
                        recentProducts: allProducts.slice(-15),
                    });
                })
            });
        });
    }
    // res.redirect('/rcj');
});
router.get('/publication', (req, res, next) => {
    res.render('publication',{
        theme: req.session.theme,
        lang: req.session.lang,
    });
    // res.redirect('/rcj');
});
router.get('/home', (req, res, next) => {
    res.render('home',{
        theme: req.session.theme,
        lang: req.session.lang,
    });
});
router.get('/theme', (req, res, next) => {
    const previousUrl = req.get('referer'); // Get the referrer URL from the request headers
    var {theme} = req.query;
    if(theme) req.session.theme = theme;
    if (previousUrl) {
        res.redirect(previousUrl); // Redirect to the previous URL
    } else {
        res.redirect('/'); // Fallback: redirect to home if there's no referrer
    }
})
router.get('/app/sitemap.xml', (req, res, next) => {
    console.log(__dirname)
    res.sendFile(path.join(__dirname, '../config/sitemap.xml'));
})
router.get('/rrl', (req, res, next) => {
    res.redirect('http://45.90.72.56:3003/');
})

module.exports = router;
