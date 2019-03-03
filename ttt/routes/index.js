// imports
var express = require('express');

var gbModule = require('../game/GameBoard');
var gbnModule = require('../game/GameBoardNode');
var gtModule = require('../game/GameTree');

var MongoClient = require('mongodb').MongoClient;

var getCurrentDate = require('../utils/date').getCurrentDate;

const sendVerificationEmail = require('../utils/mail').sendVerificationEmail;

// variables
var router = express.Router();

var playerName = "-1";
var winner = "";
var grid = [" ", " ", " ", " ", " ", " ", " ", " ", " "];

/* GameTree */
var tree = new gtModule.GameTree();
tree.buildTree(gtModule.PLAYERS_TURN);

/* MongoClient */
var db_url = 'mongodb://localhost/ttt';
var collection_users = 'users';
var collection_games = 'games';

MongoClient.connect(db_url, function(err, db){
  console.log("MongoDB connection established.");
});


/* GET default page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Account Creation */
router.post('/adduser', function(req, res) {
  var existing = false;
  var query = "";
  var username = req.body.username;
  var pass = req.body.password;
  var email = req.body.email;
  MongoClient.connect(db_url, function(err, db){
    query = db.collection(collection_users).find({"username": username}).limit(1);
    console.log(query);
  });
  res.send(query);
  res.render('index', { title: 'adduser' });
});

router.get('/send', function(req, res){
  sendVerificationEmail("jondysong@gmail.com", "key");
  res.render('index', { title: 'sent'})
});

router.get('/verify', function(req, res){
  res.render('verify', { title: 'verify'})
});

router.post('/verify', function(req, res){
  let key = res.body.key;
  let responseBody = {status: 'ERROR'}
  if(key === 'abracadabra'){
    // Find and enable user
    let email = res.body.email;

    responseBody = {status: 'OK'}
  }
  console.log(responsebody)
  res.send(responseBody);
});

/* Logging In/Out */
router.post('/login', function(req, res){
  let verified = true;
  let responseBody = {status: 'ERROR'}
  if(verified) {
    responseBody = {status: 'OK'}
  } 
  console.log(responseBody)
  res.send(responseBody)
});

router.post('/logout', function(req, res){
  let responseBody = {status: 'ERROR'}
  if(true) {
    responseBody = {status: 'OK'}
  } 
  console.log(responseBody)
  res.send(responseBody)
});

/* Viewing Games */
router.post('/listgames', function(req, res){
  let responseBody = {status: 'ERROR'}
  if(true) {
    responseBody = {status: 'OK'}
  } 
  console.log(responseBody)
  res.send(responseBody)
});

router.post('/getgame', function(req, res){
  let responseBody = {status: 'ERROR'}
  if(true) {
    responseBody = {status: 'OK'}
  } 
  console.log(responseBody)
  res.send(responseBody)
});

router.post('/getscore', function(req, res){
  let responseBody = {status: 'ERROR'}
  if(true) {
    responseBody = {status: 'OK'}
  } 
  console.log(responseBody)
  res.send(responseBody)
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
