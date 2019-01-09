var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('/home/zenaclean/zenaclean-server/dist/ADoSS/index.html');
});

module.exports = router;
