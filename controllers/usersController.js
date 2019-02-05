const dbService = require('../services/dbService');
const ethService = require('../services/ethService');
const utilities = require('./controllerUtilities');
const bcrypt = require('bcrypt');

const ssn_reg=/^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$/;
const mail_reg = /^(([^<>()\[\]\\.,;:\s@“]+(\.[^<>()\[\]\\.,;:\s@“]+)*)|(“.+“))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


class UserController {
    constructor(){}

    login(req, res) {

        let email=utilities.parse(String(req.body.email).toLowerCase());

        dbService.checkUserLogin(email, req.body.password, (status, id) => {
            if (status === 'ok') {
                console.log('logging in ' + email);
                res=utilities.setHeader(req, res);
                req.session.log="true";
                res.json({status: status, id: id});
            }
            else {
                console.log('login for user ' + email + ' failed');
                res.json({status: status, id: id});
            }
        }, err => {
            res.json(utilities.error(err));
        });
    }

    logout(req, res) {
        req.session.destroy((err) => { console.log(err);  });
    }

    check(req, res) {
        if (req.session.log=="true") {
            res=utilities.setHeader(req, res);
            res.status(200).send({status: "ok"});
        }
    }

    register(req, res) {
        console.log('adding user', req.body);

        let ssn=utilities.parse(String(req.body.ssn).toLowerCase());
        let email=utilities.parse(String(req.body.email).toLowerCase());

        if (!ssn_reg.test(ssn)) {
            res.json(utilities.error('Codice fiscale non valido')); //JSON status error (res)
            return;
        }

        if (!mail_reg.test(email)) {
            res.json(utilities.error('Indirizzo email non valido'));
            return;
        }

        if (req.body.password.length < 8) {
            res.json(utilities.error('La password è troppo breve'));
            return;
        }

        bcrypt.hash(req.body.password, 10, function(err, hash) {
            let user = {
                email: email,
                ssn: ssn,
                password: hash
            };

            // Inserimento in db (errore se c’è già email o cf)
            dbService.addUser(user, user => {
                res.json({status: 'ok'});
            }, err => {
                res.json(utilities.error('Utente o codice fiscale già registrato'));
            });
        });
    }

    cleanup(req, res) {
        dbService.cleanUsers(() => {
            res.json({status: 'ok'});
        }, err => {
            res.json(utilities.error(err.message));
        });
    }

    changePassword(req, res) {
        console.log('change password:', req.body);

        res.json({status: 'ok'});
    }

    getBalance(req, res) {
        let addr = req.query.addr;
        console.log(addr);

        ethService.getBalance(addr, bal => {
            res.json({val: bal});
            }, err => {
            res.json(utilities.error(err.message));
        });
    }

}

module.exports=new UserController();
