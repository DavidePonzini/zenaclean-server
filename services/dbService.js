const config =require("../config/config");
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
            delete report.__v;

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
                if (report.user_id === user_id) {
                    cb('error', 'non puoi votare i tuoi report');
                } else {
                    if (this.checkVotesUser(report, user_id)) {
                        cb('error', 'utente ha gia` votato');
                    } else {
                        if (is_vote_positive) {
                            report.votes_positive.push({user: user_id});

                            DbService.checkVotesThreshold(report)
                        } else {
                            report.votes_negative.push({user: user_id});
                            DbService.checkVotesThreshold(report)
                        }

                        report.save().then(() => cb('ok')).catch(cb_err);
                    }
                }
            }
        }).catch(cb_err)
    }

    hasUserAlreadyVoted(votes, user) {
        if(user === undefined)
            return false;

        // find() return the first element found which satisfies the condition,
        // otherwise, returns undefined
    	return votes.find(vote => vote.user === user) !== undefined;
    }
    
    checkVotesUser(report, user) {
        return this.hasUserAlreadyVoted(report.votes_positive, user) ||
            this.hasUserAlreadyVoted(report.votes_negative, user);
    }

    static checkVotesThreshold(report) {
        if (report.approved_positive || report.approved_negative) {
            console.log('[VOTING] report already approved, skipping check');
            return;
        }

        let vp = report.votes_positive.length;
        let vn = report.votes_negative.length;

        console.log(`[VOTING] checking report "${report.title}": (+${vp} | -${vn})`);

        if (vp + vn < config.VOTES_MIN_AMOUNT) {
            console.log('[VOTING] too few votes for approval');
            return;
        }

        if (Math.abs(vp - vn) < config.VOTES_THRESHOLD) {
            console.log('[VOTING] vote difference too low for approval');
            return;
        }

        if (vp > vn) {
            report.approved_positive = true;
            console.log('[VOTING] report approved: positive');
        } else {
            report.approved_negative = true;
            console.log('[VOTING] report approved: negative');
        }
    }
}

module.exports = new DbService();
