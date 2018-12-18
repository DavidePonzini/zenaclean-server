const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Report = require('../models/reportModel');



class DbService {

    constructor() {
    }

    init(port) {
        this.db_port = port;
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost:' + this.db_port +'/zenaclean', {useNewUrlParser: true});
    }

    addReport(report, cb) {
        return new Report(report).save().then(cb);
    }

    getReports(cb) {
        Report.find().then(cb);
    }

    addUser(user, cb_err, cb) {
        User.find().or([{email: user.email}, {ssn: user.ssn}])
            .then(data => {
                if(data[0])
                    cb_err()
                else
                    new User(user).save().then(cb);
            });
    }

    checkUserLogin(email, password, cb) {
        User.find({email: email}).then(users => {
                let user = users[0];

                if(!user) {
                    cb(false);
                    return;
                }

                bcrypt.compare(password, user.password).then(ok => {
                    if(!ok)
                        cb(false);
                    else
                        cb(true, user._id);
                });
            });
    }

};



module.exports = new DbService();
