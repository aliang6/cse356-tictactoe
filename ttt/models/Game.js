const mongoose = require('mongoose');
const Box = require('../game/GameBoard').Box;
const BOARD_SIZE = require('../game/GameBoard').BOARD_SIZE;

function emptyBoard(){
  var s = "";
  let i = 0;
  for (; i < BOARD_SIZE; i++){
    s += Box.EMPTY;
  }
  return s;
}

const gameSchema = new mongoose.Schema({
  boardState: {type: String, required: true, default: emptyBoard},
  startDate: {type: Date, required: true, default: Date.now}
});


module.exports = mongoose.model('Game', gameSchema);