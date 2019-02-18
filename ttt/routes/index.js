var express = require('express');
var router = express.Router();

var playerName = "-1"
var winner = "n"

/* GET default page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET name page. */
router.get('/ttt', function(req, res, next) {
  res.render('index', { title: 'Tic-tac-toe' });
});

/* POST name page */
router.post('/ttt', function(req, res) { // Configure the link then redirect to GET /ttt/play
  playerName = req.body.name;
  res.redirect('/ttt/play');
});

/* GET play page. */
router.get('/ttt/play', function(req, res, next) {
  if(playerName === "-1"){
    res.redirect('/ttt');
  } else {
    var x = new Date();
    var date = x.getFullYear() + "-" + x.getMonth() + 1 + "-" + x.getDate();
    res.render('play', { title: 'Tic-tac-toe', name: playerName, date: date, winner: winner});
  }
});

router.post('/ttt/play', function(req, res, next) {
  print("JSON received");
});

module.exports = router;
