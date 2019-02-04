const chai= require('chai');
const expect = chai.expect;
const sinon= require('sinon');

var Controller = require('../usersController');
var dbService = require('../../services/dbService');
var utilities = require('../controllerUtilities');
var bcrypt = require('bcrypt');


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
                email: "",
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


    it("should return an ok status when received correct sign up fields", function() {

        let expected_res_status = {status: "ok"};

        userReq.body.email = "unitTest@test.it"
        userReq.body.ssn = "VMSYVD96H70M079I"
        userReq.body.password = "validpassword"

        let addUserStub=sinon.stub(dbService, 'addUser').yields();
        let bcryptStub=sinon.stub(bcrypt, 'hash').yields(null,"passwordHash");

        Controller.register(userReq, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);

    });

    it("should return an error status when received a not valid email", function() {

        let expected_res_status = {error: "Indirizzo email non valido", status: "error"}

        userReq.body.email = "notAnEmail.it"
        userReq.body.ssn = "VMSYVD96H70M079I"
        userReq.body.password = "validpassword"

        let addUserSpy=sinon.spy(dbService, 'addUser');
        let bcryptStub=sinon.stub(bcrypt, 'hash').yields(null,"passwordHash");

        Controller.register(userReq, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);
        expect(addUserSpy.notCalled).to.be.true;

    });

    it("should return an error status when received a not valid ssn", function() {

        let expected_res_status = {error: "Codice fiscale non valido", status: "error"}

        userReq.body.email = "unitTest@test.it"
        userReq.body.ssn = "wrongSSN"
        userReq.body.password = "validpassword"

        let addUserSpy=sinon.spy(dbService, 'addUser');
        let bcryptStub=sinon.stub(bcrypt, 'hash').yields(null,"passwordHash");

        Controller.register(userReq, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);
        expect(addUserSpy.notCalled).to.be.true;

    });

    it("should return an error status when received a password too short", function() {

        let expected_res_status = {error: "La password è troppo breve", status: "error"}

        userReq.body.email = "unitTest@test.it"
        userReq.body.ssn = "VMSYVD96H70M079I"
        userReq.body.password = "short"

        let addUserSpy=sinon.spy(dbService, 'addUser');
        let bcryptStub=sinon.stub(bcrypt, 'hash').yields(null,"passwordHash");

        Controller.register(userReq, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);
        expect(addUserSpy.notCalled).to.be.true;

    });

    it("should return an error status when the email or ssn are already present into db", function() {

        let expected_res_status = {error: "Utente o codice fiscale già registrato", status: "error"}

        userReq.body.email = "unitTest@test.it"
        userReq.body.ssn = "VMSYVD96H70M079I"
        userReq.body.password = "validpassword"

        let addUserStub=sinon.stub(dbService, 'addUser').yieldsRight();
        let bcryptStub=sinon.stub(bcrypt, 'hash').yields(null,"passwordHash");

        Controller.register(userReq, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal(expected_res_status);

    });


});
