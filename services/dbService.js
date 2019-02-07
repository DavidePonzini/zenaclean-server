const config =require("../config/config");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const UserTable = require('../models/userModel');
const ReportTable = require('../models/reportModel');
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
        return new ReportTable(report).save().then(cb).catch(cb_err);
    }

    getReports(north, south, west, east, user, cb, cb_err) {
        if(north === undefined || south === undefined || west === undefined || east === undefined) {
            cb_err('missing parameters');
            return;
        }

        ReportTable.find().and([
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
        UserTable.find().or([
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
                    
                    new UserTable(user).save().then(cb).catch(cb_err);
                }
            });
    }

    checkUserLogin(email, password, cb, cb_err) {
        UserTable.find({email: email}).then(users => {
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
            };

            bcrypt.compare(password, user.password).then(ok => {
                if(!ok)
                    cb('failed');
                else
                    cb('ok', returnUser);
            }).catch(cb_err);
        }).catch(cb_err);
    }

    cleanReports(cb, cb_err) {
        ReportTable.remove().or([
            {title: 'Test'},
            {description: 'Test'}
        ]).then(cb).catch(cb_err);
    }

    cleanUsers(cb, cb_err) {
        UserTable.remove({email: /[^@]@test\.com/}).then(cb).catch(cb_err);
    }

    // TODO return
    voteReport(report_id, user_id, is_vote_positive, cb, cb_err) {
        ReportTable.find({_id: report_id}).then(reports => {
            let report = reports[0];

            if (!report) {
                cb('error', 'report non esiste');
            } else {
                if (report.user_id === user_id) {
                    debug.log('VOTING', 'user voted their own report');
                    cb('error', 'non puoi votare i tuoi report');
                } else {
                    if (this.checkVotesUser(report, user_id)) {
                        debug.log('VOTING', 'user has already voted');
                        cb('error', 'utente ha gia` votato');
                    } else {
                        if (is_vote_positive) {
                            report.votes_positive.push({user: user_id});

                            this.checkVotesThreshold(report);
                        } else {
                            report.votes_negative.push({user: user_id});
                            this.checkVotesThreshold(report);
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

    checkVotesThreshold(report) {
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
            this.giveTokenToReporter(report.user_id);
            this.giveTokenToVoters(report.votes_positive);
        } else {
            report.approved_negative = true;
            debug.log('VOTING', 'report approved: negative');
            this.giveTokenToVoters(report.votes_negative);
        }
    }

    giveTokenToReporter(reporter_id) {
        this.giveTokenToUser(reporter_id, config.TOKEN_AMOUNT.REPORTER);
    }
    
    giveTokenToVoters(voters_ids) {
        voters_ids.forEach(voter_id => {
            this.giveTokenToUser(voter_id.user, config.TOKEN_AMOUNT.VOTER);
        });
    }

    giveTokenToUser(user_id, amount) {
        UserTable.find({_id: user_id}).then(users => {
            const user = users[0];

            if(!user) {
                debug.error('REWARD', `user ${user_id} does not exist`);
                return;
            }

            debug.log('REWARD_DB', `giving ${amount} to ${user.email} (${user.eth_address})`);
            ethService.giveReward(user.eth_address, amount);
        }).catch(err => {
            debug.error('REWARD', err.message);
        });
    }
}

module.exports = new DbService();
