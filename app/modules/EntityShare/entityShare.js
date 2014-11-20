/*global require, console, process, exports */
var EntityShare = require('../../models/entityShare');
var systemSettings = require('../../../config/systemSettings');
var async = require('async');
var uuid = require('uuid');
var redis = require("redis");
var shareClient = redis.createClient();

shareClient.select(2, function (err) {
    if (err) {
        console.log('There was an issue connecting the provided Redis instance.');
        process.exit(1);
    }
});

exports.create = function (data, callback) {
    try {
        async.waterfall([

            function (_callback) {
                new EntityShare({
                    entity: data.entity,
                    shared_on: new Date(),
                    expires_on: data.expires_on || null,
                    isPublic: data.isPublic || true,
                    sharedWith: data.sharedWith || []
                }).save(function (err, result) {
                    if (err || !result) {
                        _callback(err || 'Unknown error', null);
                    } else {
                        _callback(null, result._id);
                    }
                });
            },
            function (id, _callback) {
                var key = uuid.v4().replace(/-/g, '');
                shareClient.set(key, id, function (err) {
                    _callback(err, systemSettings.host.domain + '/share?id=' + key);
                });
            }
        ], callback);
    } catch (ex) {
        callback('Unknown error', null);
    }
};

exports.getEntityIdForKey = function (key, callback) {
    try {
        async.waterfall([

            function (_callback) {
                shareClient.get(key, function (err, es) {
                    _callback(err || !es ? 'Error' : null, es);
                });
            },
            function (es, _callback) {
                EntityShare.findOne({
                    _id: es
                }).exec(function (err, share) {
                    _callback(err, share.entity);
                });
            }
        ], callback);
    } catch (ex) {
        callback('Unknown error', null);
    }
};

exports.removeKey = function (key, callback) {
    try {
        shareClient.del(key, callback);
    } catch (ex) {
        callback('Unknown error');
    }
};