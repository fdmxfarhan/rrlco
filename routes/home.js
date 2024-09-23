var express = require('express');
var router = express.Router();
var path = require('path');

const { ensureAuthenticated } = require('../config/auth');
const { homedir } = require('os');

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
        res.render('home-fa',{
            theme: req.session.theme,
            lang: req.session.lang,
            user: req.user
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
// router.get('/sitemap.xml', (req, res, next) => {
//     console.log(__dirname)
//     res.sendFile(path.join(__dirname, '../config/sitemap.xml'));
// })
module.exports = router;
