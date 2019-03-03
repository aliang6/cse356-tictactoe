const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
  enabled: {type: Boolean, default: false},
  games: [Number]
});

module.exports = mongoose.model('User', userSchema);