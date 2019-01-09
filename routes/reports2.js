var express = require('express');
var router = express.Router();
var dbService = require('../services/dbService');

/*
const session = require('express-session');
router.use(session({ secret: 'zenauth' }));
*/


/* GET reports listing. */
router.get('/', function(req, res, next) {
    dbService.getReports(reports => {
        res.send(200, JSON.stringify(reports));
    }, err => {
        res.json({status: 'error', message: err})
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

	if (req.session.log=="true") {
		
		dbService.addReport(report, status => {
	        res.header('Access-Control-Allow-Credentials', true);
         	res.header('Access-Control-Max-Age', '86400');
		    res.header('Access-Control-Allow-Origin', req.headers.origin);
        	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        	res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
			res.send(200, {status: "ok"});
		}, err => {
	        	res.json({status: 'error', message: err})
   		});
	}
	else res.sendStatus(401);
});

router.get('/cleanup', function(req, res) {
    dbService.cleanReports(() => {
        res.send(200, {status: 'ok'})
    }, err => {
        res.json({status: 'error', message: err})
    })
})
module.exports = router;
