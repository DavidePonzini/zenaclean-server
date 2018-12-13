const mongoose = require('mongoose');

class DbService {

    constructor() {
    }

    init(port) {
        this.db_port = port;
        mongoose.connect('mongodb://localhost:' + this.db_port +'/test', (err, db) => {
            console.log(err);
            if(err) throw err;
            db.close();
        });

        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'error connecting to db'));
        db.once('open', () => {
            console.log('connected to db');
            var schema = new mongoose.Schema({name: String});
            var report_schema = mongoose.model('Reports', schema);
            this.Reports = report_schema;
        });
    }

    addReport(report, cb) {
        console.log("report to add: " + JSON.stringify(report));

        this.Reports.create(report, cb);
    }
    getReports(cb) {
        this.Reports.find().exec(cb);
    }


};


module.exports = new DbService();