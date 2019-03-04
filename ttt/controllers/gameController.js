const User = require('../models/User');
const Game = require('../models/Game');
const UserController = require('./userController');

async function getGameIDs(uid){
    var user = UserController.findUserByID(uid);
    return (user == null) ? null : user.games;
};

module.exports.getGameIDs = getGameIDs;

module.exports.listGameIDs = async(uid) => {
    var games = getGameIDs(uid);
    if (games == null) 
        return null;
    var result = [];
    for (var i in games){
        let game = games[i];
        result.push({"id": game._id, "start_date": game.startDate });
    }
    return result;
};

module.exports.getCurrentGameID = async(uid) => {
    var games = getGameIDs(uid);
    if (games == null)
        return null;
    var currentGameID = games[games.length-1];
    return currentGameID;
};

module.exports.getGame = async(gameID) => {
    var games = await Game.findById(gameID).limit(1);
    if (games.length == 0)
        return null;
    return games[0];
};

module.exports.createGame = async(uid) => {
    var user = await UserController.findUserByID(uid);
    if (user == null)
        return false;
    var newGame = Game.create()
        .then(g => {
            return g;
        })
        .catch(e => {
            console.log(e);
            return null;
        });
    if (newGame != null){
        user.games.push(newGame);
        user.save()
            .then(u => {
                return true;
            })
            .catch(e => {
                console.log(e);
                return false;
            });
    }
    return false;
}