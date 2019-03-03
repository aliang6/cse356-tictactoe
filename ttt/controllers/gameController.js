const User = require('../models/User');
const Game = require('../models/Game');

async function getGames(uid){
    var users = await User.findById(uid);
    if (users.length == 0)
        return null;
    return user[0].games;
};

module.exports.getGames = getGames;

module.exports.getGameIDs = async(uid) => {
    var games = getGames(uid);
    if (games == null) 
        return null;
    var result = [];
    for (var i in games){
        let game = games[i];
        ids.push({"id": game.gameID, "start_date": game.startDate });
    }
    return result;
}

module.exports.getGame = async(gameID) => {
    var games = await Game.find({"gameID": gameID}).limit(1);
    if (games.length == 0)
        return null;
    return games[0];
};