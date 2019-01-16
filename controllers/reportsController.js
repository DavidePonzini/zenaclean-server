var dbService = require('../services/dbService');
var utilities = require('./controllerUtilities');

class ReportController{
    constructor() { }

    getReports(req, res) {
        dbService.getReports(req.query.ne_lat, req.query.sw_lat, req.query.sw_lng, req.query.ne_lng, req.query.user, reports => {
            res.json(reports);
        }, err => {
            res.json({status: 'error', message: err});
        });
    }

    addReport(req, res) {
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
            res=utilities.setHeader(req, res);
            res.json({status: "ok"});
        }, err => {
            res.json({status: 'error', error: err.message})
        });

    }

    cleanup(req, res) {
        dbService.cleanReports(() => {
            res.json({status: 'ok'});
        }, err => {
            res.json({status: 'error', error: err.message});
        })
    }

    vote(req, res) {
        console.log(req.body)

        const user = req.body.user;
        const report = req.body.report;
        const vote = req.body.vote === '1';

        dbService.voteReport(report, user, vote, (status, message) => {
            // if (req.session.log)
            res.json({status: status, error: message});
        }, err => {
            res.json({status: 'error', error: err.message});
        });
    }

}

module.exports=new ReportController();
