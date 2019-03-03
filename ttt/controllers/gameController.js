const User = require('../models/User');
const Game = require('../models/Game');

async function getGames(uid){
    var user = await User.findById(uid);
    return user.games;
};

module.exports.getGames = getGames;

module.exports.getGameIDs = async(uid) => {
    var games = getGames(uid);
    var result = [];
    for (var i in games){
        let game = games[i];
        ids.push({"id": game.gameID, "start_date": game.startDate });
    }
    return result;
}

module.exports.getGame = async(gameID) => {
    var game = await Game.find({"gameID": gameID}).limit(1);
    return game;
};