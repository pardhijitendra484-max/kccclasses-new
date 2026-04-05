const router      = require('express').Router()
const { protect, requireRole } = require('../middleware/auth')
const User         = require('../models/User')
const Fee          = require('../models/Fee')
const Homework     = require('../models/Homework')
const Attendance   = require('../models/Attendance')
const Test         = require('../models/Test')
const Announcement = require('../models/Announcement')
const { emails }   = require('../service/emailSender')

const guard = [protect, requireRole('admin')]

// ── Dashboard Stats ───────────────────────────────────────────────────────────
router.get('/dashboard', ...guard, async (req, res) => {
  try {
    const [students, teachers, fees] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Fee.find({})
    ])
    const feeCollected = fees.filter(f => f.status === 'paid').reduce((a, f) => a + (f.paidAmount || 0), 0)
    const feePending   = fees.filter(f => f.status !== 'paid').length
    res.json({ status: 'SUCCESS', data: { students, teachers, feeCollected, feePending } })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', ...guard, async (req, res) => {
  try {
    const { role, search } = req.query
    const filter = {}
    if (role) filter.role = role
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ]
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 })
    res.json({ status: 'SUCCESS', data: users })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.post('/users', ...guard, async (req, res) => {
  try {
    const { name, email, password, role, course, phone, subject } = req.body
    if (!name || !email) return res.status(400).json({ status: 'FAILED', message: 'Name and email required.' })
    if (await User.findOne({ email })) return res.status(409).json({ status: 'FAILED', message: 'Email already registered.' })
    const plainPassword = password || 'Tuition@123'
    const u = await User.create({
      name, email,
      password: plainPassword,
      role: role || 'student',
      course: course || null,
      phone: phone || null,
      subject: subject || null
    })
    // 📧 Send welcome email with login credentials
    emails.welcome(email, name, role || 'student', plainPassword, { course, subject })
    res.status(201).json({ status: 'SUCCESS', message: 'Account created! Welcome email sent.', data: { id: u._id, name: u.name } })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.put('/users/:id', ...guard, async (req, res) => {
  try {
    const { name, email, phone, course, subject, isActive, feeStatus, role } = req.body
    const u = await User.findByIdAndUpdate(req.params.id,
      { name, email, phone, course, subject, isActive, feeStatus, role },
      { new: true, runValidators: true }
    ).select('-password')
    if (!u) return res.status(404).json({ status: 'FAILED', message: 'User not found' })
    res.json({ status: 'SUCCESS', data: u })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.delete('/users/:id', ...guard, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ status: 'SUCCESS' })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Fees ──────────────────────────────────────────────────────────────────────
router.get('/fees', ...guard, async (req, res) => {
  try {
    const fees = await Fee.find().populate('student', 'name email phone').sort({ createdAt: -1 })
    res.json({ status: 'SUCCESS', data: fees })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.post('/fees', ...guard, async (req, res) => {
  try {
    const { student, month, amount, dueDate } = req.body
    if (!student || !month || !amount)
      return res.status(400).json({ status: 'FAILED', message: 'Student, month and amount required' })
    const fee = await Fee.create({ student, month, amount, dueDate: dueDate || null, paidAmount: 0, status: 'pending' })
    // 📧 Notify student about new fee record
    const studentUser = await User.findById(student)
    if (studentUser?.email) {
      emails.feeAdded(studentUser.email, studentUser.name, { month, amount, dueDate })
    }
    res.status(201).json({ status: 'SUCCESS', data: fee })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.put('/fees/:id/collect', ...guard, async (req, res) => {
  try {
    const { paidAmount, method } = req.body
    const fee = await Fee.findById(req.params.id).populate('student', 'name email')
    if (!fee) return res.status(404).json({ status: 'FAILED', message: 'Fee record not found' })
    fee.paidAmount = paidAmount
    fee.method     = method || 'cash'
    fee.paidDate   = new Date()
    fee.status     = paidAmount >= fee.amount ? 'paid' : 'partial'
    fee.receiptNo  = 'RCP' + Date.now().toString().slice(-8)
    await fee.save()
    await User.findByIdAndUpdate(fee.student._id || fee.student, { feeStatus: fee.status })
    // 📧 Send payment receipt to student
    if (fee.student?.email) {
      emails.feeReceipt(fee.student.email, fee.student.name, fee, fee.receiptNo)
    }
    res.json({ status: 'SUCCESS', receiptNo: fee.receiptNo })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.delete('/fees/:id', ...guard, async (req, res) => {
  try { await Fee.findByIdAndDelete(req.params.id); res.json({ status: 'SUCCESS' }) }
  catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Fee Reminder — send bulk overdue reminders ────────────────────────────────
router.post('/fees/send-reminders', ...guard, async (req, res) => {
  try {
    // Find all students with pending/overdue fees
    const pendingFees = await Fee.find({
      status: { $in: ['pending', 'partial', 'overdue'] }
    }).populate('student', 'name email')

    // Group by student
    const byStudent = {}
    for (const fee of pendingFees) {
      if (!fee.student?.email) continue
      const sid = fee.student._id.toString()
      if (!byStudent[sid]) byStudent[sid] = { student: fee.student, fees: [] }
      byStudent[sid].fees.push(fee)
    }

    let sent = 0
    for (const { student, fees } of Object.values(byStudent)) {
      const ok = await emails.feeReminder(student.email, student.name, fees)
      if (ok) sent++
    }
    res.json({ status: 'SUCCESS', message: `Fee reminders sent to ${sent} students` })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Teacher Attendance (Admin View) ──────────────────────────────────────────
router.get('/teacher-attendance', ...guard, async (req, res) => {
  try {
    const { teacherId } = req.query
    const filter = teacherId ? { markedBy: teacherId } : {}
    const records = await Attendance.find(filter)
      .populate('markedBy', 'name email')
      .sort({ date: -1 })
      .limit(100)
    res.json({ status: 'SUCCESS', data: records })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.post('/teacher-attendance', ...guard, async (req, res) => {
  try {
    const { teacherId, date, status } = req.body
    if (!teacherId || !date || !status)
      return res.status(400).json({ status: 'FAILED', message: 'teacherId, date, status required' })
    res.json({ status: 'SUCCESS', message: 'Teacher attendance recorded' })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Announcements ─────────────────────────────────────────────────────────────
router.get('/announcements', ...guard, async (req, res) => {
  try {
    const anns = await Announcement.find({ postedByRole: 'admin' }).sort({ createdAt: -1 })
    res.json({ status: 'SUCCESS', data: anns })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.post('/announcements', ...guard, async (req, res) => {
  try {
    const { title, message, audience } = req.body
    if (!title || !message)
      return res.status(400).json({ status: 'FAILED', message: 'Title and message required' })
    const a = await Announcement.create({
      title, message, audience: audience || 'all',
      postedBy: req.user.id, postedByName: req.user.name, postedByRole: 'admin'
    })

    // 📧 Send announcement email to relevant users
    const roleFilter = audience === 'students' ? { role: 'student' }
      : audience === 'teachers' ? { role: 'teacher' }
      : { role: { $in: ['student', 'teacher'] } }
    const recipients = await User.find({ ...roleFilter, isActive: true }).select('name email')
    for (const u of recipients) {
      emails.announcement(u.email, u.name, a, req.user.name, 'Admin')
    }

    res.status(201).json({ status: 'SUCCESS', data: a, emailsSent: recipients.length })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.delete('/announcements/:id', ...guard, async (req, res) => {
  try { await Announcement.findByIdAndDelete(req.params.id); res.json({ status: 'SUCCESS' }) }
  catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── All Homework (Admin View) ─────────────────────────────────────────────────
router.get('/homework', ...guard, async (req, res) => {
  try {
    const hw = await Homework.find({}).populate('assignedBy', 'name').sort({ createdAt: -1 })
    res.json({ status: 'SUCCESS', data: hw })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── All Tests (Admin View) ────────────────────────────────────────────────────
router.get('/tests', ...guard, async (req, res) => {
  try {
    const tests = await Test.find({}).populate('teacher', 'name').sort({ date: -1 })
    res.json({ status: 'SUCCESS', data: tests })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

module.exports = router
