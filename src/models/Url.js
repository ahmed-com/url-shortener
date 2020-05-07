const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  _id: String,
  longUrl: String,
  hits: [
    {
      type: Date,
      default: Date.now,
    },
  ],
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
