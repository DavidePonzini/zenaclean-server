const chai= require('chai');
const expect = chai.expect;
const sinon= require('sinon');

var Controller = require('../usersController');
var dbService = require('../../services/dbService');
var utilities = require('../controllerUtilities');


describe("UserController", function() {

    let res, userReq ;

    beforeEach(function(){

        // to restore all mocks before a test
        sinon.restore();

        // mock setheader, it returns always the req object parameter
        headerStub=sinon.stub(utilities, 'setHeader').returnsArg(1);

        res = {
            json: sinon.spy()
        }

        userReq = {
            body: {
                email: "unitTest@test.it",
                password: "",
                ssn: "",
            },

            // TODO session.log is only for debug ????
            session: {
                log: ""
            }
        };


    });

    it("should return an ok status when received correct login credentials", function() {

        let checkLoginStub=sinon.stub(dbService, 'checkUserLogin').yields("ok",1);
        let expected_res_status = {status: "ok", id: 1}

        Controller.login(userReq, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);

    });


    it("should return a failed status when received wrong login credentials", function() {

        let checkLoginStub=sinon.stub(dbService, 'checkUserLogin').yields("failed",1);
        let expected_res_status = {status: "failed", id: 1}

        Controller.login(userReq, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);

    });

    it("should return an error status when received an error from the db service", function() {

        let error = {
            message: "error message"
        }

        let checkLoginStub=sinon.stub(dbService, 'checkUserLogin').yieldsRight(error.message);
        let expected_res_status = {status: "error", error: error.message}

        Controller.login(userReq, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);

    });


});
