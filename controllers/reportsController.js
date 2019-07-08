const fs = require('fs');
const path = require('path');
const dbService = require('../services/dbService');
const utilities = require('./controllerUtilities');
const debug = require('../util/util-debug');

const writeImageToDisk = (filename, data, cb) => {
    let filepath = path.join(__dirname, 'public/images/' + filename)
    fs.writeFile(filepath, data, {encoding: 'base64'}, cb);
    return filepath;
}


class ReportController{
    constructor() { }

    getReports(req, res) {
        dbService.getReports(req.query.ne_lat, req.query.sw_lat, req.query.sw_lng, req.query.ne_lng, req.query.user, reports => {
            res.json(reports);
        }, err => {
            res.json({status: 'error', message: err});
        });
    }

    uploadPhoto(req, res) {
       let form = {
		userId: req.body.userId,
		id: req.body.id,
                url: 'images/' + req.file.filename
	};
        debug.log('upload photo', req.file);
        dbService.addPhotoToReport(form, id => {
            res=utilities.setHeader(req, res);
            res.json({status: "ok", _id: id, url: form.url});
        }, err => {
            res.json({status: 'error', error: err.message})
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

