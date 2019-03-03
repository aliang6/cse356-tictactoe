const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  enabled: {type: Boolean, default: false},
  games: [Number]
});

module.exports = mongoose.model('User', userSchema);