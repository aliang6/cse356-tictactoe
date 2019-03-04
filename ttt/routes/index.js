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

router.get('/games', async(req, res) => {
  var games = await GameController.getGames();
  res.send(games);
});

router.post('/adduser', async(req, res) => {
  let responseBody = { };
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let username = req.body.username;
  let pass = req.body.password;
  let email = req.body.email;
  if (username == undefined || pass == undefined || email == undefined)
    return res.json(responseBody);
  let success = await UserController.addUser(username,pass,email);
  if (success)
    responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
  return res.json(responseBody);
});

router.post('/finduser', async(req, res) => {
  var user = await UserController.findUser(req.body.username);
  return res.json(user);
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
  if (email == undefined || key == undefined)
    return res.json(responseBody);
  let uid = await UserController.verifyUser(email, key);
  if (uid != null){
    console.log(uid);
    responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
    // create a new Game for the user
    await GameController.createGame(uid);
  }
  return res.json(responseBody);
});

/* Logging In/Out */
router.post('/login', async(req, res) => {
  let responseBody = { };
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let username = req.body.username;
  let password = req.body.password;
  if (username == undefined || password == undefined)
    return res.json(responseBody);
  let userid = await UserController.authUser(username,password);
  if (userid != null)
    responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
  res.cookie(jsonConstants.UID_COOKIE, userid);
  return res.json(responseBody);
});

router.post('/logout', async(req, res) => {
  let responseBody = { };
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let uid = req.cookies.uid;
  if (uid == undefined)
    return res.json(responseBody);
  let user = await UserController.findUserByID(uid);
  if (user != null){
    responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
    res.clearCookie(jsonConstants.UID_COOKIE);
  }
  return res.json(responseBody);
});

/* Viewing Games */
router.post('/listgames', async(req, res) => {
  let responseBody = {};
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let uid = req.cookies.uid;
  if (uid == undefined)
    return res.json(responseBody);
  let games = await GameController.listGameIDs(uid);
  if (games == null)
    return res.json(responseBody);
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
  responseBody[jsonConstants.GAMES_KEY] = games;
  return res.json(responseBody);
});

router.post('/getgame', async(req, res) => {
  let responseBody = {}
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let gameID = req.body.id;
  if (gameID == undefined)
    return res.json(responseBody);
  let game = await GameController.getGame(gameID);
  if (game == null)
    return res.json(responseBody);
  let gameNode = tree.findNodeByID(game.boardState);
  responseBody = gameNode.toJSON();
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_OK;
  return res.json(responseBody)
});

router.post('/getscore', async(req, res) => {
  let responseBody = {};
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let uid = req.cookies.uid;
  if (uid == undefined)
    return res.json(responseBody);
  let games = await GameController.listGameIDs(uid);
  if (games == null)
    return res.json(responseBody);
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
  res.json(responseBody)
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
router.post('/ttt/play', async(req, res) => {
  let responseBody = {};
  responseBody[jsonConstants.STATUS_KEY] = jsonConstants.STATUS_ERR;
  let uid = req.cookies.uid;
  if (uid == undefined)
    return res.json(responseBody);
  pos = req.body.move;
  let gameID = GameController.getCurrentGameID(uid);
  let game = GameController.getGame(gameID);
  let board = gbModule.GameBoard.fromJSON(game.boardState);
  if (board == null ){
    return res.json(responseBody);
  }
  let nextNode = tree.AIPlayGame(board, pos);
  if (nextNode == null)
    return res.json(responseBody);

  // If the match has ended, create a new Game for the user.
  if (nextNode.isEnd){
    await GameController.createGame(uid);
  }
  return res.json(nextNode.toJSON());
  //res.render('play', { title: 'Tic-tac-toe', name: playerName, date: date, winner: winner, grid: grid});
  
});


module.exports = router;
