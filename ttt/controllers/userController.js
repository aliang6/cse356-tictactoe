const User = require('../models/User');

module.exports.getUsers = async() => {
    var users = await User.find({});
    if (!users) return null;
    console.log(users);
    return users;
}

module.exports.findUser = async(username) => {
    var user = await User.find({ 'username' : username }).limit(1);
    return user;
};

module.exports.addUser = async(username, password, email) => {
    var newUser = new User({"username": username, "password": password, "email": email});
    console.log(newUser);
    var success = await newUser.save();
    return (!success) ? false : true;
};

module.exports.verifyUser = async(email, key) => {
    var user = await User.find({ 'email': email }).limit(1);
    if (!user) return null;
    if (key == user._id){
        var success = await user.update({"enabled": true});
        return (!success) ? false : true;
    }
    return false;
};

module.exports.authUser = async(username, password) => {
    var user = await User.find({ 'username': username, 'password': password }).limit(1);
    return (!user) ? false : true;
};