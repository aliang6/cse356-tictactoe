const User = require('../models/User');

module.exports.getUsers = async() => {
    var users = await User.find({});
    if (!users) return null;
    console.log(users);
    return users;
}

async function findUser(username){
    var user = await User.find({ 'username' : username }).limit(1);
    console.log(user);
    return user;
};

module.exports.findUser = findUser;

module.exports.addUser = async(username, password, email) => {
    var user = findUser(username);
    console.log("user" + user);
    var user = await User.find({ 'email' : email});
    console.log("trying to save");
    User.create({"username": username, "password": password, "email": email})
        .then(doc => {
            console.log("hi");
            console.log(doc);
        })
        .catch(err => {
            console.log(err);
        });
    return true;
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