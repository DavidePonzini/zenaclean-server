var express = require('express');
var router = express.Router();
var dbService = require('../services/dbService');
var reportController= require('../controllers/reportsController');
var multer = require('multer');

var upload = multer({ dest: 'public/images/' })

router.get('/', reportController.getReports);

router.post('/', reportController.addReport);

router.post('/uploadPhoto', upload.single('photo'), reportController.uploadPhoto);

router.get('/cleanup', reportController.cleanup);

router.post('/vote', reportController.vote);

module.exports = router;
