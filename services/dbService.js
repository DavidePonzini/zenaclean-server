const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Report = require('../models/reportModel');

class DbService {
    constructor() { }

    init(port) {
        this.db_port = port;
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost:' + this.db_port +'/zenaclean', {useNewUrlParser: true});
    }

    addReport(report, cb, cb_err) {
        return new Report(report).save().then(cb).catch(cb_err);
    }

    getReports(north, south, west, east, user, cb, cb_err) {
        if(north === undefined || south === undefined || west === undefined || east === undefined) {
            cb_err('missing parameters');
            return;
        }

        Report.find().and([
            {latitude: {$lte: north}},
            {latitude: {$gte: south}},
            {longitude: {$gte: west}},
            {longitude: {$lte: east}},
            ])
            .sort({timestamp: 'desc'})
            .then(reports => {
        		reports = this.setReportProperties(reports, user);
        		cb(reports);
	    }).catch(cb_err);
    }

    setReportProperties(reports, user) {
        let result = [];

        reports.forEach(report => {
            report = report.toObject();

            report.voted_positive = this.hasUserAlreadyVoted(report.votes_positive, user);
            report.voted_negative = this.hasUserAlreadyVoted(report.votes_negative, user);

            delete report.votes_positive;
            delete report.votes_negative;

            result.push(report);
        });

        return result
    }

    addUser(user, cb, cb_err) {
        User.find().or([
            {email: user.email},
            {ssn: user.ssn}
            ]).then(data => {
                if(data[0])
                    cb_err();
                else
                    new User(user).save().then(cb).catch(cb_err);
            });
    }

    checkUserLogin(email, password, cb, cb_err) {
        User.find({email: email}).then(users => {
            const user = users[0];

            if(!user) {
                cb('failed');
                return;
            }
            const returnUser = {
                email: user.email,
                ssn: user.ssn,
                id: user._id
            }
            bcrypt.compare(password, user.password).then(ok => {
                if(!ok)
                    cb('failed');
                else
                    cb('ok', returnUser);
            }).catch(cb_err);
        }).catch(cb_err);
    }

    cleanReports(cb, cb_err) {
        Report.remove().or([
            {title: 'Test'},
            {description: 'Test'}
        ]).then(cb).catch(cb_err);
    }

    cleanUsers(cb, cb_err) {
        User.remove({email: /[^@]@test\.com/}).then(cb).catch(cb_err);
    }

    // TODO return
    voteReport(report_id, user_id, is_vote_positive, cb, cb_err) {
        Report.find({_id: report_id}).then(reports => {
            let report = reports[0];

            if (!report) {
                cb('error', 'report non esiste');
            } else {

                if (this.checkVotesUser(report, user_id)) {
                    cb('error', 'utente ha gia` votato');
                } else {
                    if (is_vote_positive) {
                        report.votes_positive.push({user: user_id});
                        // TODO check votes threshold
                    } else {
                        report.votes_negative.push({user: user_id});
                        // TODO check votes threshold
                    }

                    report.save().then(() => cb('ok')).catch(cb_err);
                }
            }
        }).catch(cb_err)
    }

    // find() return the first element found which satisfies the condition,
    // otherwise, returns undefined
    hasUserAlreadyVoted(votes, user) {
        if(user === undefined)
            return false;

    	return votes.find(vote => vote.user === user) !== undefined;
    }
    
    checkVotesUser(report, user) {
        return this.hasUserAlreadyVoted(report.votes_positive, user) ||
            this.hasUserAlreadyVoted(report.votes_negative, user);
    }
}

module.exports = new DbService();
