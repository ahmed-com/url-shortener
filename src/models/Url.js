const mongoose = require('mongoose');

const hitSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
});

const urlSchema = new mongoose.Schema({
  _id: String,
  longUrl: String,
  hits: [hitSchema],
  date: { type: Date, default: Date.now },
});

urlSchema.pre('save', async function (next) {
  if (this.date < Date.now + 1000) {
    this.hits++;
    await this.save();
  }
  next();
});

module.exports = mongoose.model('Url', urlSchema);
