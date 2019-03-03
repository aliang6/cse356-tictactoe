// express
const express = require('express');

// cookieparser
const cookieParser = require('cookie-parser');

// gametree
const gbModule = require('../game/GameBoard');
const gbnModule = require('../game/GameBoardNode');
const gtModule = require('../game/GameTree');
const PLAYERS_TURN = gtModule.PLAYERS_TURN;
const DRAW_TURN = gtModule.DRAW_TURN;
const AI_TURN = gtModule.AI_TURN;

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
var jsonConstants = require('../utils/jsonConstants');

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
  res.send(users);
});

router.post('/adduser', async(req, res) => {
  let responseBody = { };
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let username = req.body.username;
  let pass = req.body.password;
  let email = req.body.email;
  if (username == undefined || pass == undefined || email == undefined){
    res.send(responseBody);
    return;
  }
  let success = await UserController.addUser(username,pass,email);
  if (success)
    responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
  res.send(responseBody);
});

router.post('/finduser', async(req, res) => {
  var user = await UserController.findUser(req.body.username);
  res.send(user);
});

router.get('/send', function(req, res){
  sendVerificationEmail("jondysong@gmail.com", "key");
  res.render('index', { title: 'sent'})
});

router.get('/verify', function(req, res){
  res.render('verify', { title: 'verify'})
});

router.post('/verify', async(req, res) => {
  let responseBody = { };
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let email = req.body.email;
  let key = req.body.key;
  if (email == undefined || key == undefined){
    res.send(responseBody);
    return;
  }
  let success = await UserController.verifyUser(email, key);
  if (success)
    responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
  res.send(responseBody);
});

/* Logging In/Out */
router.post('/login', async(req, res) => {
  let responseBody = { };
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let username = req.body.username;
  let password = req.body.password;
  if (username == undefined || password == undefined){
    res.send(responseBody);
    return;
  }
  let userid = await UserController.authUser(username,password);
  if (userid != null)
    responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
  res.cookie(jsonConstants.UID_COOKIE, userid);
  res.send(responseBody);
});

router.post('/logout', async(req, res) => {
  let responseBody = { };
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let uid = req.cookies.uid;
  if (uid == undefined){
    res.send(responseBody);
    return;
  }
  let user = await UserController.findUserById(uid);
  if (user != null){
    responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
    res.clearCookie(jsonConstants.UID_COOKIE);
  }
  res.send(responseBody);
});

/* Viewing Games */
router.post('/listgames', async(req, res) => {
  let responseBody = {};
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let uid = req.cookies.uid;
  if (uid == undefined){
    res.send(responseBody);
    return;
  }
  let games = await GameController.getGameIDs(uid);
  if (games == null){
    res.send(responseBody);
    return;
  }
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
  responseBody[jsonConstants.GAMES_KEY] = games;
  res.send(responseBody);
});

router.post('/getgame', async(req, res) => {
  let responseBody = {}
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let gameID = req.body.id;
  if (gameID == undefined){
    res.send(responseBody);
    return;
  }
  let game = await GameController.getGame(gameID);
  if (game == null){
    res.send(responseBody);
    return;
  }
  let gameNode = tree.findNodeByID(game.boardState);
  responseBody = gameNode.toJSON();
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
  res.send(responseBody)
});

router.post('/getscore', async(req, res) => {
  let responseBody = {};
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let uid = req.cookies.uid;
  if (uid == undefined){
    res.send(responseBody);
    return;
  }
  let games = await GameController.getGameIDs(uid);
  if (games == null){
    res.send(responseBody);
    return;
  }
  let human = 0, wopr = 0, tie = 0;
  for (var i in games){
    let game = games[i];
    let gameNode = tree.findNodeByID(game.boardState);
    if (gameNode.isEnd){
      if (gameNode.winner == PLAYERS_TURN)
        human += 1;
      else if (gameNode.winner == AI_TURN)
        wopr += 1;
      else if (gameNode.winner == DRAW_TURN)
        tie += 1;
    }
  }
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
  responseBody[jsonConstants.SCORE_PLAYER_KEY] = human;
  responseBody[jsonConstants.SCORE_AI_KEY] = wopr;
  responseBody[jsonConstants.SCORE_TIE_KEY] = tie;
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
