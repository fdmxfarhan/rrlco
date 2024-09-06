var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res, next) => {
    res.render('./animalfeeder/animalfeeder',{
        theme: req.session.theme,
        lang: req.session.lang,
        user: req.user
    });
});

module.exports = router;