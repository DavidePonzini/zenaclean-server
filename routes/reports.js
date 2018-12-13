var express = require('express');
var router = express.Router();
var dbService = require('../services/dbService')


/* GET users listing. */
router.get('/', function(req, res, next) {
    const report = {name: 'test'};

    dbService.addReport(report, (err, rep) => {
        console.log('addreport');
        console.log(err, rep);
        if(err) throw err;
    });

    console.log('report added?')

    dbService.getReports((err, rep) => {
        console.log('getreports');
        console.log(err, rep);

        if(err)
            res.send(200, JSON.stringify(err));
        else
            res.send(200, JSON.stringify(rep));
    });

    console.log('sono in fondo alla funzione');



});

module.exports = router;
