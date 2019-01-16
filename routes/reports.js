var express = require('express');
var router = express.Router();
var dbService = require('../services/dbService');
var reportController= require('../controllers/reportsController');

router.get('/', reportController.getReports);

router.post('/', reportController.addReport);

router.get('/cleanup', reportController.cleanup);

router.post('/vote', reportController.vote);

module.exports = router;
