/*global require, exports */
var User = require('../../models/user');
var nodemailer = require('nodemailer');
var async = require('async');
var redis = require("redis");
var resetClient = redis.createClient();
var uuid = require('uuid');
var systemSettings = require('../../../config/systemSettings');

resetClient.select(1, redis.print);

var transport = nodemailer.createTransport("SMTP", {});

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

exports.resetPassword = function (data, callback) {
    try {
        async.waterfall([

            function (_callback) {
                User.findOne({
                    email: data.email
                }, function (err, user) {
                    if (err) {
                        _callback(err, null);
                    } else if (!user) {
                        _callback('User not found', null);
                    } else {
                        _callback(null, user._id);
                    }
                });
            },
            function (uid, _callback) {
                var token = uuid.v4().replace(/-/g, '');
                resetClient.set(token, uid, function (err) {
                    if (err) {
                        _callback(err, null);
                    } else {
                        _callback(null, token);
                    }
                });
            },
            function (token, _callback) {
                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: systemSettings.support.email, // TODO: Pull from config
                    to: data.email, // list of receivers
                    subject: 'Reset Password Request', // Subject line
                    html: '<a href="' + systemSettings.domain + '/reset?token=' + token + '">Reset Password Link</a>' // html body
                };
                

                // send mail with defined transport object
                transport.sendMail(mailOptions, function (err) {
                    _callback(err);
                });
            }
        ], function (err) {
            callback(err);
        });
    } catch (ex) {
        console.log(ex);
        callback('Unknown error');
    }
};

exports.validateResetToken = function (token, callback) {
    try {
        resetClient.get(token, function (err, uid) {
            if (err) {
                callback(err, null);
            } else if (!uid) {
                callback('Not found', null);
            } else {
                resetClient.del(token);
                callback(null, uid);
            }
        });
    } catch (ex) {
        callback('Unknown error');
    }
};