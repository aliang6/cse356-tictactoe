const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameID: Number,
  boardState: Number,
  startDate: Date
});

module.exports = mongoose.model('Game', gameSchema);