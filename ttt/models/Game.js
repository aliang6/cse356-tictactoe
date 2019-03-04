const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  boardState: {type: Number, required: true},
  startDate: {type: Date, required: true}
});

module.exports = mongoose.model('Game', gameSchema);