const mongoose = require('mongoose');

const urlSchema = mongoose.Schema({
    _id: String,
    longUrl: String,
    date: { type: String, default: Date.now }
});

module.exports = mongoose.model('Url',urlSchema);