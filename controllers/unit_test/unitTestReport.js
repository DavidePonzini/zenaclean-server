const chai= require('chai');
const expect = chai.expect;
const sinon= require('sinon');

var Controller = require('../reportsController');
var dbService = require('../../services/dbService');
var utilities = require('../controllerUtilities');


describe("ReportController", function() {

    let res, reportReq, queryReq;

    beforeEach(function(){

        // to restore all mocks before a test
        sinon.restore();

        // mock setheader, it returns always the req object parameter
        headerStub=sinon.stub(utilities, 'setHeader').returnsArg(1);

        res = {
            json: sinon.spy()
        }

        reportReq = {
            body: {
                title: "Unit Test",
                timestamp: "",
                latitude: "",
                longitude: "",
                address: "",
                description: "",
                url: "",
                id: ""
            }
        };

        queryReq = {
            query: {
                ne_lat: "",
                sw_lat: "",
                sw_lng: "",
                se_lng: "",
                user: "",
            }
        };

    });

    it("should return an ok status when a new report is correctly saved", function() {

        let addReportStub=sinon.stub(dbService, 'addReport').yields();
        let expected_res_status = {status: "ok"}

        Controller.addReport(reportReq, res);

        // res.json called once
        expect(res.json.calledOnce).to.be.true;

        // expect to get the expected argument
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);


    });

    it("should return an error status when a new report is not correctly saved", function() {

        let error = {
            message: "error message"
        }
        let addReportStub=sinon.stub(dbService, 'addReport').yieldsRight(error);
        let expected_res_status = {status: "error", error: error.message}

        Controller.addReport(reportReq, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);

    });

    it("should return a list of reports when received a correct get ", function() {

        let exptectedReportList = ["Report1", "Report2", "Report3"]
        let getReportStub=sinon.stub(dbService, 'getReports').yields(exptectedReportList);

        Controller.getReports(queryReq, res);


        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(exptectedReportList);

    });

    it("should return an error status when received an error from the db service ", function() {

        let error = {
            message: "error message"
        }
        // TODO fix consistency between {status: "error", message: error.message} and {status: "error", error: error.message}
        let expected_res_status = {status: "error", message: error.message}
        let getReportStub=sinon.stub(dbService, 'getReports').yieldsRight(error.message);


        Controller.getReports(queryReq, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);

    });

});
