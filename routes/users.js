const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

const sanitize = require('mongo-sanitize');
const xss = require('xss');
const bcrypt = require('bcrypt');
const body = require('body-parser');
router.use(body.json());

let ssn_reg=/^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$/;
let mail_reg = /^(([^<>()\[\]\\.,;:\s@]+(\.[^<>()\[\]\\.,;:\s@]+)*)|(.+))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function setHeader(req, res) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Max-Age', '86400');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    return res;
}

router.post('/login', function(req, res) {
    let email=parse(String(req.body.email).toLowerCase());

    dbService.checkUserLogin(email, req.body.password, (status, user) => {
        if (status === 'ok') {
            console.log('logging in ' + email);
            res=setHeader(req, res);
            req.session.log="true";
            res.json({status: status, user});
        }
        else {
            console.log('login for user ' + email + ' failed');
            res.json({status: status});
        }
    }, err => {
        res.json(error(err))
    });
});

router.post('/logout', function(req, res) {
    req.session.destroy((err) => { console.log(err);  });
});

router.post('/check', function(req, res) {
    if (req.session.log=="true") {
        res=setHeader(req, res);
        res.status(200).send({status: "ok"});
    }
});

router.post('/register', function(req, res) {
    console.log('adding user', req.body);

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

    if (req.body.password.length < 8) {
        res.json(error('La password è troppo breve'));
        return;
    }

    bcrypt.hash(req.body.password, 10, function(err, hash) {
        let user = {
            email: email,
            ssn: ssn,
            password: hash
        };

        // Inserimento in db (errore se cè già email o cf)
        dbService.addUser(user, user => {
            res.json({status: 'ok'});
        }, err => {
            res.json(error('Utente o codice fiscale già registrato'));
        });
    });
});

router.get('/cleanup', function(req, res) {
   dbService.cleanUsers(() => {
       res.json({status: 'ok'});
   }, err => {
       res.json({status: 'error', error: err.message});
   });
});


// TODO change password
router.post('/change-password', function (req, res) {
    console.log('change password:', req.body);

    res.json({status: 'ok'});
});


function parse(string) {
    return sanitize(xss(string.trim()));
}

function error(message) {
    return {
        status: 'error',
        error: message
    };
}

module.exports = router;
