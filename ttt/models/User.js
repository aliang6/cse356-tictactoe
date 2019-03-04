const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
  enabled: {type: Boolean, default: false},
  games: [mongoose.Schema.Types.ObjectId]
});

module.exports = mongoose.model('User', userSchema);