/*global require, module */
var mongoose = require('mongoose');

var entitySchema = mongoose.Schema({
    owner: String,
    parent: String,
    type: String,
    key: String,
    name: String,
    size: Number,
    date_added: Date,
    last_modified: Date
});

module.exports = mongoose.model('Entity', entitySchema);