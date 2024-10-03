var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
const Animalfeeder = require('../models/Animalfeeder');

router.get('/', (req, res, next) => {
    var {id} = req.query;
    Animalfeeder.findOne({id}, (err, feeder) => {
        res.render('./animalfeeder/animalfeeder',{
            theme: req.session.theme,
            lang: req.session.lang,
            user: req.user,
            feeder,
        });
    })
});
router.get('/api', (req, res, next) => {
    var { id } = req.query;
    const animalFeederData = {
        time: [
            { hour: 10, minute: 0, second: 0 },
            { hour: 0, minute: 0, second: 5 },
            { hour: 0, minute: 0, second: 5 },
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