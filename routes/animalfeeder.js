var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res, next) => {
    const animalFeederData = {
        time: [
            { hour: 10, minute: 0, second: 0 },
            { hour: 0, minute: 0, second: 5 },
        ],
        id: 10,
    };
    res.json(animalFeederData);

    // res.render('./animalfeeder/animalfeeder',{
    //     theme: req.session.theme,
    //     lang: req.session.lang,
    //     user: req.user
    // });
});

module.exports = router;