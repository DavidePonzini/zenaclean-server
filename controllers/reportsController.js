const dbService = require('../services/dbService');
const utilities = require('./controllerUtilities');
const debug = require('../util/util-debug');

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
            user_id: req.body.id ? req.body.id : '1', // TODO remove temporary fix (and change it also in the reply)
        };

        debug.log('ADD REPORT', 'adding report', report);


        dbService.addReport(report, report => {
            res=utilities.setHeader(req, res);
            res.json({status: "ok", report_id: report.user_id, _id: report._id});
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
        const user = req.body.user;
        const report = req.body.report;
        const vote = req.body.vote === 1;

        debug.log('VOTING', `user ${user} voted report ${report} (${vote ? '+1' : '-1'})`);

        dbService.voteReport(report, user, vote, (status, message) => {
            res.json({status: status, error: message});
        }, err => {
            res.json({status: 'error', error: err.message});
        });
    }

}

module.exports=new ReportController();
