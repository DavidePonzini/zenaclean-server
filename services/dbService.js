const config =require("../config/config");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Report = require('../models/reportModel');
const ethService = require('./ethService');
const debug = require('../util/util-debug');

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
                else{
                    let eth = ethService.createUser();
                    user.eth_address = eth.address;
                    user.eth_private_key = eth.privateKey;
                    console.log(user);
                    
                    new User(user).save().then(cb).catch(cb_err);
                }
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
                id: user._id,
                eth_address: user.eth_address
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

                            DbService.checkVotesThreshold(report, cb, cb_err);
                        } else {
                            report.votes_negative.push({user: user_id});
                            DbService.checkVotesThreshold(report, cb, cb_err);
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

    checkVotesThreshold(report, cb, cb_err) {
        if (report.approved_positive || report.approved_negative) {
            debug.log('VOTING', 'report already approved, skipping check');
            return;
        }

        let vp = report.votes_positive.length;
        let vn = report.votes_negative.length;

        debug.log('VOTING' , `checking report "${report.title}": (+${vp} | -${vn})`);

        if (vp + vn < config.VOTES_MIN_AMOUNT) {
            debug.log('VOTING', 'too few votes for approval');
            return;
        }

        if (Math.abs(vp - vn) < config.VOTES_THRESHOLD) {
            debug.log('VOTING', 'vote difference too low for approval');
            return;
        }

        if (vp > vn) {
            report.approved_positive = true;
            debug.log('VOTING', 'report approved: positive');
            this.giveTokenToReporter(report.user_id, cb, cb_err);
            this.giveTokenToVoters(report.votes_positive, cb, cb_err);
        } else {
            report.approved_negative = true;
            debug.log('VOTING', 'report approved: negative');
            this.giveTokenToVoters(report.votes_negative, cb, cb_err);
        }
    }

    giveTokenToReporter(reporter_id, cb, cb_err) {
        this.giveTokenToUser(reporter_id, config.TOKEN_AMOUNT_REPORTER, cb, cb_err);
    }
    
    giveTokenToVoters(voters_ids, cb, cb_err) {
        voters_ids.forEach(voter_id => {
            this.giveTokenToUser(voter_id, config.TOKEN_AMOUNT_VOTER, cb, cb_err);
        });
    }

    giveTokenToUser(user_id, amount, cb, cb_err) {
        User.find({_id: user_id}).then(users => {
            const user = users[0];

            debug.log('REW', user);

            if(!user) {
                cb_err('failed');
                return;
            }

            debug.log('REWARD_DB', `giving ${amount} to ${user.email} (${user.eth_address}`);
            ethService.giveReward(user.eth_address, amount, cb, cb_err);
        }).catch(cb_err);
    }
}

module.exports = new DbService();
