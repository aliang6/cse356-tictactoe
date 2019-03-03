const User = require('../models/User');

module.exports.getUsers = function(){
    var users = await User.find({});
    if (!users) return null;
    console.log(users);
    return users;
}

module.exports.findUser = function(username){
    var user = await User.find({ 'username' : username }).limit(1);
    return user;
};

module.exports.addUser = function(username, password, email){
    var newUser = new User({"username": username, "password": password, "email": email});
    var success = await newUser.save();
    return (!success) ? false : true;
};

module.exports.verifyUser = function(email, key){
    var user = await User.find({ 'email': email }).limit(1);
    if (!user) return null;
    user.enabled = true;
    var success = await user.save();
    return (!success) ? false : true;
};

module.exports.authUser = function(username, password){
    var user = await User.find({ 'username': username, 'password': password }).limit(1);
    return (!user) ? false : true;
};