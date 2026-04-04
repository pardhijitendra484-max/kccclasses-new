const mongoose = require('mongoose')
const S = new mongoose.Schema({
  student:    { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  month:      { type: String, required: true },
  amount:     { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate:    { type: Date },
  paidDate:   { type: Date, default: null },
  status:     { type: String, enum:['paid','pending','overdue','partial'], default:'pending' },
  method:     { type: String, default: null },
  receiptNo:  { type: String, default: null },
  notes:      { type: String, default: '' }
}, { timestamps: true })
module.exports = mongoose.model('Fee', S)
