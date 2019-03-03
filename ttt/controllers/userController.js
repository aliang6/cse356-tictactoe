const User = require('../models/User');

module.exports.getUsers = async() => {
    var users = await User.find({});
    return users;
}

async function findUser(username){
    var user = await User.find({ 'username' : username }).limit(1);
    return user;
};

module.exports.findUser = findUser;

module.exports.addUser = async(username, password, email) => {
    var users = findUser(username);
    if (users.length > 0)
        return false;
    var users = await User.find({ 'email' : email});
    if (users.length > 0)
        return false;
    var newUser = {"username": username, "password": password, "email": email};
    return User.create(newUser)
        .then(doc => {
            return true;
        })
        .catch(err => {
            return false;
        });
};

module.exports.verifyUser = async(email, key) => {
    var users = await User.find({ 'email': email }).limit(1);
    if (users.length == 0) return null;
    if (key == user._id){
        users.enabled = true;
        users.save()
            .then(doc => {
                return true;
            })
            .catch(err => {
                return false;
            });
    }
    return false;
};

module.exports.authUser = async(username, password) => {
    var users = await User.find({ 'username': username, 'password': password }).limit(1);
    return (users.length == 0) ? false : true;
};