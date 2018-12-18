var express = require('express');
var router = express.Router();
var dbService = require('../services/dbService');


/* GET reports listing. */
router.get('/', function(req, res, next) {
    dbService.getReports(reports => {
        res.send(200, JSON.stringify(reports));
    });
})

/* POST new report.*/
.post('/', function(req, res) {
	console.log(req.body);
	dbService.addReport(req.body, status => {
		res.send(200);
    	});
});

module.exports = router;
