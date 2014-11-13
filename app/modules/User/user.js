/*global require, exports */
var User = require('../../models/user');

exports.register = function (data, callback) {
    try {
        User.findOne({
            email: data.email
        }, function (err, user) {
            if (err) {
                callback(err, null);
            } else if (user) {
                callback('Email already exists', null);
            } else {
                // TODO: Validate data
                var newUser = new User();

                // set the user's local credentials
                newUser.email = data.email;
                newUser.password = newUser.generateHash(data.password);
                newUser.firstName = data.firstName;
                newUser.lastName = data.lastName;

                // save the user
                newUser.save(function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, newUser);
                    }
                });
            }
        });
    } catch (ex) {
        callback('Unknown error', null);
    }
};