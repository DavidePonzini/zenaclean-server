var express = require('express');
var router = express.Router();
var dbService = require('../services/dbService');


/* GET reports listing. */
router.get('/', function(req, res, next) {
    dbService.getReports(reports => {
        res.send(200, JSON.stringify(reports));
    });
});

/* POST new report.*/
router.post('/', function(req, res) {
	let report = {
		title: req.body.title,
		timestamp: req.body.timestamp,
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		address: req.body.address,
		description: req.body.description,
		url: req.body.url,
		user_id: req.body.id ? req.body.url : '1', // TODO remove temporary fix
	};

	console.log('adding report', report);

	dbService.addReport(report, status => {
		res.send(200, {status: "ok"});
	});
});

module.exports = router;
