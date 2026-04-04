const mongoose = require('mongoose')
const S = new mongoose.Schema({
  date:     { type: Date,   required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  records: [{
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String },
    status:      { type: String, enum: ['present','absent','late'], default: 'absent' },
  }]
}, { timestamps: true })
// Prevent duplicate attendance for same date by same teacher
S.index({ date: 1, markedBy: 1 }, { unique: true })
module.exports = mongoose.model('Attendance', S)
