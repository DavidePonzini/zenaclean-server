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

    getReports(north, south, west, east, cb, cb_err) {
        if(north === undefined || south === undefined || west === undefined || east === undefined) {
            cb_err('missing parameters');
            return;
        }

        Report.find().and([
            {latitude: {$lte: north}},
            {latitude: {$gte: south}},
            {longitude: {$gte: west}},
            {longitude: {$lte: east}},
            ]).then(cb).catch(cb_err);
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

            bcrypt.compare(password, user.password).then(ok => {
                if(!ok)
                    cb('failed');
                else
                    cb('ok', user._id);
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
}

module.exports = new DbService();
