var express = require('express');
var router = express.Router();
var dbService = require('../services/dbService');


router.get('/', function(req, res, next) {
	dbService.getReports(req.query.ne_lat, req.query.sw_lat, req.query.sw_lng, req.query.ne_lng, reports => {
        res.json(reports);
    }, err => {
        res.json({status: 'error', message: err});
    });
});


router.post('/', function(req, res) {
	let report = {
		title: req.body.title,
		timestamp: req.body.timestamp,
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		address: req.body.address,
		description: req.body.description,
		url: req.body.url,
		user_id: req.body.id ? req.body.id : '1', // TODO remove temporary fix
	};

	console.log('adding report', report);

	dbService.addReport(report, status => {
		res.json({status: "ok"});
	}, err => {
        res.json({status: 'error', error: err.message})
    });
});

router.get('/cleanup', function(req, res) {
    dbService.cleanReports(() => {
        res.json({status: 'ok'});
    }, err => {
        res.json({status: 'error', error: err.message});
    })
});

router.get('/vote', function (req, res) {
    console.log(req.query)

    const user = req.query.user;
    const report = req.query.report;
    const vote = req.query.vote === '1';

    dbService.voteReport(report, user, vote, (status, message) => {
        res.json({status: status, error: message});
    }, err => {
        res.json({status: 'error', error: err.message});
    });
});

module.exports = router;
