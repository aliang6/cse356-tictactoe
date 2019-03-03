// express
const express = require('express');

// gametree
const gbModule = require('../game/GameBoard');
const gbnModule = require('../game/GameBoardNode');
const gtModule = require('../game/GameTree');

// mongoose
const mongoose = require('mongoose');
var mongodb = 'mongodb://localhost/ttt';
var collection_users = 'users';
var collection_games = 'games';
mongoose.connect(mongodb, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// mongoose models
// const User = require('../models/User');
// const Game = require('../models/Game');
const UserController = require('../controllers/userController');
const GameController = require('../controllers/gameController');

// utils
const getCurrentDate = require('../utils/date').getCurrentDate;

// variables
var router = express.Router();

var playerName = "-1";
var winner = "";
var grid = [" ", " ", " ", " ", " ", " ", " ", " ", " "];

var tree = new gtModule.GameTree();
tree.buildTree(gtModule.PLAYERS_TURN);


/* GET default page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Account Creation */
router.post('/finduser', function(req, res){
  res.send(UserController.findUser(req.body.username));
});

router.post('/adduser', function(req, res) {
  var existing = false;
  var query = "";
  var username = req.body.username;
  var pass = req.body.password;
  var email = req.body.email;
  res.send(query);
});

router.post('/verify', function(req, res){
  res.render('index', { title: 'verify'})
});

/* Logging In */
router.post('/login', function(req, res){
  res.render('index', { title: 'login'})
});

router.post('/logout', function(req, res){
  res.render('index', { title: 'logout'})
});

/* Viewing Games */
router.post('/listgames', function(req, res){
  res.render('index', { title: 'listgames'})
});

router.post('/getgame', function(req, res){
  res.render('index', { title: 'getgame'})
});

router.post('/getscore', function(req, res){
  res.render('index', { title: 'getscore'})
});

/* GET name page. */
router.get('/ttt', function(req, res) {
  grid = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
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
router.post('/ttt/play', function(req, res) {
  console.log("post request received");
  console.log(req.body);
  grid = req.body.grid;
  let board = gbModule.GameBoard.fromJSON(grid);
  console.log(grid);
  if (board != null)
    console.log(board.toString());
  if (board == null ){
    return res.json({"grid": grid, "winner": ""});
  }
  let nextNode = tree.AIPlayGame(board);
  console.log("made move");
  console.log(nextNode.toJSON());
  return res.json(nextNode.toJSON());
  //res.render('play', { title: 'Tic-tac-toe', name: playerName, date: date, winner: winner, grid: grid});
  
});


module.exports = router;
