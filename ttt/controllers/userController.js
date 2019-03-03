const User = require('../models/User');

module.exports.getUsers = function(){
    var query = User.find({});
    return query.exec(function(err,users){
        if (err)
            return null;
        return users;
    });
}

module.exports.findUser = function(username){
    var query = User.find({ 'username' : username }).limit(1);
    return query.exec(function(err, user){
        if (err)
            return null;
        return user;
    });
};

module.exports.addUser = function(username, password, email){
    var newUser = new User({"username": username, "password": password, "email": email});
    return newUser.save(function(err){
        if (err)
            return false;
        return true;
    });
};

module.exports.verifyUser = function(email, key){
    var query = User.find({ 'email': email }).limit(1);
    return query.exec(function(err, user){
        if (err)
            return false;
        user.enabled = true;
        return success;
    });
};

module.exports.authUser = function(username, password){
    var query = User.find({ 'username': username, 'password': password }).limit(1);
    return query.exec(function(err, user){
        if (err)
            return false;
        return true;
    });
};