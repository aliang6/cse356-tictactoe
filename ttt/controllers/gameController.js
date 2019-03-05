const User = require('../models/User');
const Game = require('../models/Game');
const UserController = require('./userController');

module.exports.getGames = async() => {
    var games = await Game.find({});
    return games;
}

async function getGameIDs(uid){
    var user = await UserController.findUserByID(uid);
    return (user == null) ? null : user.games;
};

module.exports.getGameIDs = getGameIDs;

async function listGames(uid) {
    var gameIDs = await getGameIDs(uid);
    if (gameIDs == null) 
        return null;
    var result = [];
    for (var i = 0; i < gameIDs.length; i++){
        let game = await getGame(gameIDs[i]);
        result.push(game);
    }
    return result;
};

module.exports.listGames = listGames;

module.exports.listGameIDs = async(uid) => {
    var games = await listGames(uid);
    var result = [];
    for (var i = 0; i < games.length; i++){
        let game = games[i];
        result.push({"id": game._id, "start_date": game.startDate });
    }
    return result;
};

async function getCurrentGameID(uid) {
    var games = await getGameIDs(uid);
    if (games == null || games.length == 0)
        return null;
    var currentGameID = games[games.length-1];
    return currentGameID;
}

module.exports.getCurrentGameID = getCurrentGameID;

async function getGame(gameID){
    var game = await Game.findById(gameID).limit(1);
    return game;
};

module.exports.getGame = getGame;

module.exports.createGame = async(uid) => {
    var user = await UserController.findUserByID(uid);
    if (user == null)
        return false;
    var newGame = await Game.create({});
    if (newGame != null){
        user.games.push(newGame);
        await user.save();
        return true;
    }
    return false;
}

module.exports.setGameState = async(game, state) => {
    game.boardState = state;
    await game.save();
    return true;
}