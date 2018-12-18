const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

const sanitize = require('mongo-sanitize');
const xss = require('xss');
const bcrypt = require('bcrypt');
const body = require('body-parser');
router.use(body.json());

let ssn_reg=/^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$/;
let mail_reg = /^(([^<>()\[\]\\.,;:\s@“]+(\.[^<>()\[\]\\.,;:\s@“]+)*)|(“.+“))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/* GET users listing. */
router.post('/login', function(req, res) {
    let email=parse(String(req.body.email).toLowerCase());

    dbService.getUser(email, req.body.password, (ok, id) => {
            res.status(200).send({status: ok, id: id});
    });
});

/* POST new user.*/
router.post('/register', function(req, res) {

    let ssn=parse(String(req.body.ssn).toLowerCase());
    let email=parse(String(req.body.email).toLowerCase());

    if (!ssn_reg.test(ssn)) {
        res.json(error('Codice fiscale non valido')); //JSON status error (res)
        return;
    }

    if (!mail_reg.test(email)) {
        res.json(error('Indirizzo email non valido'));
        return;
    }

    if (req.body.password.length<6) {
        res.json(error('La password è troppo breve'));
        return;
    }
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        console.log(hash);

        let user = {
            email: email,
            ssn: ssn,
            password: hash
        };

        // Inserimento in db (errore se c’è già email o cf)
        dbService.addUser(user, err => {
            res.json(error('Utente esiste già'));
        }, user => {
            res.json({status:'ok'});
        });
    });
});

function parse(string) {
    return sanitize(xss(string.trim()));
}

function error(message) {
    return {status:'error',error:message};
}

module.exports = router;