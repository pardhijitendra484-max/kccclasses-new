const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const S = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  phone:     { type: String, default: null },
  role:      { type: String, enum: ['admin','teacher','student'], default: 'student' },
  course:    { type: String, default: null },
  subject:   { type: String, default: null },   // for teachers
  isActive:  { type: Boolean, default: true },
  feeStatus: { type: String, enum: ['paid','pending','overdue','partial'], default: 'pending' },
  lastLogin: { type: Date, default: null }
}, { timestamps: true })

S.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})
S.methods.comparePassword = function(p) { return bcrypt.compare(p, this.password) }

module.exports = mongoose.model('User', S)
