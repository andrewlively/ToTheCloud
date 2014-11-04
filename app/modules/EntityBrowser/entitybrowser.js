/*global require, exports, __dirname */
var Entity = require('../../models/entity');
var fs = require('fs-extra');
var uuid = require('uuid');
var async = require('async');

exports.getEntitiesForLevel = function (data, callback) {
    Entity.find({
        owner: data.owner,
        parent: data.parent || null
    }).lean().exec(function (err, result) {
        callback(err, result);
    });
};

exports.createNewFileEntity = function (data, callback) {
    try {
        async.waterfall([

            function (callback) {
                // Read the file
                var newKey = uuid.v4();
                var newPath = __dirname + '/../../files/' + data.user + '/' + newKey;
                
                fs.move(data.file.path, newPath, function (err) {
                    callback(err, newKey);
                });
            },
            function (newKey, callback) {
                // Create a new entity record
                new Entity({
                    owner: data.user,
                    parent: data.parent,
                    type: 'file',
                    key: newKey,
                    name: data.file.originalname,
                    size: data.file.size,
                    date_added: new Date(),
                    last_modified: new Date()
                }).save(callback);
            }
        ], function (err) {
            callback(err);
        });
    } catch (ex) {
        callback('Unknown error');
    }
};

exports.createNewFolderEntity = function (data, callback) {
    try {
        new Entity({
            owner: data.user,
            parent: data.parent,
            type: 'folder',
            name: data.folder.name,
            date_added: new Date(),
            last_modified: new Date()
        }).save(callback);
    } catch (ex) {
        callback('Unknown error');
    }
};