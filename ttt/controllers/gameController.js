const User = require('../models/User');
const Game = require('../models/Game');
const UserController = require('./userController');

module.exports.getGames = async() => {
    var games = await Game.find({});
    return games;
}

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
    var newGame = null;
    console.log("hi");
    Game.create({})
        .then(g => {
            newGame = g;
            console.log("hi4");
        })
        .catch(e => {
            console.log(e);
            console.log("hi5");
        });
    console.log(newGame);
    console.log("hi");
    if (newGame != null){
        user.games.push(newGame);
        user.save()
            .then(u => {
                console.log("hi2");
                return true;
            })
            .catch(e => {
                console.log(e);
                console.log("hi3");
                return false;
            });
    }
    console.log("hi");
    return false;
}