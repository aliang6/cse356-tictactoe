const User = require('../models/User');
const Game = require('../models/Game');

module.exports.getGames = async function getGames(uid){
    var query = User.findById(uid);
    var games = null;
    query.exec(function(err,user){
        if (err)
            return;
        games = user.games;
    });
    if (games == null)
        return null;
    return games;
};

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
    var query = Game.find({"gameID": gameID});
    return query.exec(function(err,game){
        if (err)
            return null;
        return game;
    });
};