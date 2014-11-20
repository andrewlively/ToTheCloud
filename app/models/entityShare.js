/*global require, module */
var mongoose = require('mongoose');

var entityShareSchema = mongoose.Schema({
    entity: String,
    shared_on: Date,
    expires_on: Date,
    isPublic: Boolean,
    sharedWith: [String]
});

module.exports = mongoose.model('EntityShare', entityShareSchema);