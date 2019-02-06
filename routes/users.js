const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');

router.post('/login', usersController.login);

router.post('/logout', usersController.logout);

router.post('/check', usersController.check);

router.post('/register', usersController.register);

router.get('/cleanup', usersController.cleanup);

// TODO change password
router.post('/change-password', usersController.changePassword);

router.get('/balance', usersController.getBalance);


module.exports = router;
