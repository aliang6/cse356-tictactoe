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
mongoose.Promise = require('bluebird');
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

const sendVerificationEmail = require('../utils/mail').sendVerificationEmail;

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
router.get('/users', async(req, res) => {
  var users = await UserController.getUsers();
  console.log(users);
  res.send(users);
});

router.post('/adduser', async(req, res) => {
  var username = req.body.username;
  var pass = req.body.password;
  var email = req.body.email;
  var success = await UserController.addUser(username,pass,email);
  console.log((success) ? "success" : "failed");
  res.send(success);
});

router.post('/finduser', async(req, res) => {
  var user = await UserController.findUser(req.body.username);
  console.log(user);
  res.send(user);
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
router.get('/login', function(req, res){
  res.render('login')
});

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
