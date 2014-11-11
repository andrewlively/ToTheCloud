/*global require, exports, __dirname */
var Entity = require('../../models/entity');
var fs = require('fs-extra');
var uuid = require('uuid');
var async = require('async');
var _ = require('lodash');

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

exports.deleteFileEntity = function (data, callback) {
    async.waterfall([

        function (callback) {
            Entity.findOne({
                _id: data.file
            }, function (err, result) {
                if (result.owner === String(data.user)) {
                    result.remove(function (e) {
                        callback(e, result.key);
                    });
                } else {
                    callback('Not authorized to delete this entity', null);
                }
            });
        },
        function (key, callback) {
            fs.remove(__dirname + '/../../files/' + data.user + '/' + key, callback);
        }
    ], callback);
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

exports.deleteFolderEntity = function (data, callback) {
    try {
        var folders = [data.folder];
        var files = [];

        async.eachSeries(folders, function (id, _callback) {
            Entity.find({
                parent: id
            }).exec(function (err, ent) {
                if (!err && ent) {
                    var results = _.groupBy(ent, function (obj) {
                        return obj.type;
                    });

                    if (results.folder) {
                        results.folder.forEach(function (obj) {
                            folders.push(obj._id);
                        });
                    }

                    if (results.file) {
                        results.file.forEach(function (obj) {
                            files.push(obj);
                        });
                    }

                    _callback(err);
                } else {
                    _callback(err);
                }
            });
        }, function (err) {
            if (err) {
                callback(err);
            } else {
                async.series([
                    function (callback) {
                        // Remove the entities from the database
                        Entity.remove({
                            _id: {
                                $in: folders
                            }
                        }, function (e) {
                            if (e) {
                                callback(e);
                            } else {
                                callback(null);
                            }
                        });
                    },
                    function (callback) {
                        // Remove each of the files from the database then delete the file
                        async.eachSeries(files, function (obj, cb) {
                            Entity.remove({
                                _id: obj._id
                            }, function (err) {
                                if (err) {
                                    cb(err);
                                } else {
                                    fs.remove(__dirname + '/../../files/' + data.user + '/' + obj.key, function (err) {
                                        if (err) {
                                            cb(err);
                                        } else {
                                            cb(null);
                                        }
                                    });
                                }
                            });
                        }, callback);
                    }
                ], function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });

    } catch (ex) {
        callback('Unknown error');
    }
};