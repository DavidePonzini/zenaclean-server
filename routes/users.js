const express = require('express');
const router = express.Router();
var userController=require('../controllers/usersController');
var utilities = require('../controllers/controllerUtilities');

router.post('/login', userController.login);

router.post('/logout', userController.logout);

router.post('/check', userController.check);

router.post('/register', userController.register);

router.get('/cleanup', userController.cleanup);

router.post('/change-password', userController.changePassword);

module.exports = router;
