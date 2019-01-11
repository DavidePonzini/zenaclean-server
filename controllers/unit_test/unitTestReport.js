const chai= require('chai');
const expect = chai.expect;
const sinon= require('sinon');

//var Controller = require('../reportsController');
var dbService = require('../../services/dbService');
/*
describe("ReportController", function() {

    let res, req;

    beforeEach(function(){
        // to restore all mocks before a test
        sinon.restore();
        res = {
            json: sinon.spy()
        }
    });

    it("should correctly add a new report", function() {

        let addReportStub=sinon.stub(dbService, 'addReport').yields(null, "ok");
        req = {
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
        //Controller.addReport(req, res);
        //expect(res.json.calledOnce).to.be.true;


    });

});
/*

describe("ReportController", function() {

    let res={}, req={};

    beforeEach(function(){
        // to restore all mocks before a test
        //sinon.restore();
        res = {
            json: sinon.spy()
        }
    })

    describe("When adding a new report"), function(){
        it("should correctly add a new report", function(){

           let addReportStub=sinon.stub(dbService, 'addReport').yields(null, "ok");
           req = {
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
           //Controller.addReport(req, res);
           //expect(res.json.calledOnce).to.be.true;

        })

    }

});*/