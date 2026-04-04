const mongoose = require('mongoose')
const S = new mongoose.Schema({
  title:          { type: String, required: true },
  subject:        { type: String, required: true },
  description:    { type: String, required: true },
  dueDate:        { type: Date,   required: true },
  priority:       { type: String, enum: ['high','medium','low'], default: 'medium' },
  assignedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedByName: { type: String },
  course:         { type: String, default: null }, // optional course filter
  submissions: [{
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String },
    note:        { type: String },
    submittedAt: { type: Date, default: Date.now },
    grade:       { type: String, default: null },
  }]
}, { timestamps: true })
module.exports = mongoose.model('Homework', S)
