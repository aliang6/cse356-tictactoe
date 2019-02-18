var express = require('express');
var router = express.Router();

var playerName = "-1";
var winner = "n";
var grid = "        O";

var gbModule = require('../game/GameBoard');
var gbnModule = require('../game/GameBoardNode');
var gtModule = require('../game/GameTree');

var tree = new gtModule.GameTree();
tree.buildTree(gtModule.PLAYERS_TURN);


/* GET default page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET name page. */
router.get('/ttt', function(req, res, next) {
  grid = "         ";
  res.render('index', { title: 'Tic-tac-toe' });
});

/* POST name page */
router.post('/ttt', function(req, res) { // Configure the link then redirect to GET /ttt/play
  playerName = req.body.name;
  var x = new Date();
  var date = x.getFullYear() + "-" + x.getMonth() + 1 + "-" + x.getDate();
  res.render('play', { title: 'Tic-tac-toe', name: playerName, date: date, winner: winner, grid: grid});
});

/* POST play page */
router.post('/ttt/play', function(req, res, next) {
  console.log("post request received");
  console.log(req.body);
  grid = req.body.grid;
  let node = tree.findNode(grid);
  if (node == null){
    return res.send({grid: grid, winner: ""});
  }
  let nextNode = tree.AIPlayGame(grid);
  return res.send(nextNode.toJSON());
  //res.render('play', { title: 'Tic-tac-toe', name: playerName, date: date, winner: winner, grid: grid});
  
});


module.exports = router;
