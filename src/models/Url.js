const mongoose = require('mongoose');

const hitSchema = new mongoose.Schema({
  date: String,
  hitCount : Number
});

const urlSchema = new mongoose.Schema({
  _id: String,
  longUrl: String,
  hits: [hitSchema],
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Url', urlSchema);
