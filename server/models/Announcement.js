const mongoose = require('mongoose')
const S = new mongoose.Schema({
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  audience:      { type: String, enum: ['all','students','teachers'], default: 'all' },
  postedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedByName:  { type: String },
  postedByRole:  { type: String },
}, { timestamps: true })
module.exports = mongoose.model('Announcement', S)
