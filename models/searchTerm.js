const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var searchTermSchema = new Schema({
        searchVal: String,
        searchDate: Date,
});

var Model = mongoose.model('searchTerm', searchTermSchema);

module.exports = Model;