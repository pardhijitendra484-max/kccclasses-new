const mongoose = require('mongoose')
const S = new mongoose.Schema({
  title:    { type: String, required: true },
  subject:  { type: String, required: true },
  date:     { type: Date,   required: true },
  maxMarks: { type: Number, default: 100 },
  duration: { type: String, default: '' },
  teacher:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  results: [{
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String },
    marks:       { type: Number },
    grade:       { type: String },
  }]
}, { timestamps: true })
module.exports = mongoose.model('Test', S)
