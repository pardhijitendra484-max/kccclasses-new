const router      = require('express').Router()
const { protect, requireRole } = require('../middleware/auth')
const User         = require('../models/User')
const Homework     = require('../models/Homework')
const Attendance   = require('../models/Attendance')
const Test         = require('../models/Test')
const Announcement = require('../models/Announcement')
const Fee          = require('../models/Fee')

const guard = [protect, requireRole('student')]

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', ...guard, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json({ status: 'SUCCESS', user })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Homework ─────────────────────────────────────────────────────────────────
// Students see ALL homework (not filtered by teacher)
router.get('/homework', ...guard, async (req, res) => {
  try {
    const hw = await Homework.find({}).sort({ createdAt: -1 })
    res.json({ status: 'SUCCESS', data: hw })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.post('/homework/:id/submit', ...guard, async (req, res) => {
  try {
    const { note } = req.body
    const hw = await Homework.findById(req.params.id)
    if (!hw) return res.status(404).json({ status: 'FAILED', message: 'Not found' })
    // Check already submitted
    const already = hw.submissions.find(s => s.student.toString() === req.user.id)
    if (already) return res.status(400).json({ status: 'FAILED', message: 'Already submitted' })
    const user = await User.findById(req.user.id)
    hw.submissions.push({ student: req.user.id, studentName: user.name, note: note || '' })
    await hw.save()
    res.json({ status: 'SUCCESS', message: 'Homework submitted!' })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Fees ─────────────────────────────────────────────────────────────────────
router.get('/fees', ...guard, async (req, res) => {
  try {
    const fees = await Fee.find({ student: req.user.id }).sort({ createdAt: -1 })
    res.json({ status: 'SUCCESS', data: fees })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Results ───────────────────────────────────────────────────────────────────
router.get('/results', ...guard, async (req, res) => {
  try {
    const tests = await Test.find({}).sort({ date: -1 })
    const data = tests.map(t => ({
      _id: t._id,
      title: t.title,
      subject: t.subject,
      date: t.date,
      maxMarks: t.maxMarks,
      duration: t.duration,
      myResult: t.results.find(r => r.student.toString() === req.user.id) || null
    }))
    res.json({ status: 'SUCCESS', data })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Attendance ────────────────────────────────────────────────────────────────
// Returns all attendance records for this student across all teachers
router.get('/attendance', ...guard, async (req, res) => {
  try {
    const allRecords = await Attendance.find({
      'records.student': req.user.id
    }).sort({ date: -1 })

    // Flatten: one entry per date
    const data = allRecords.map(att => {
      const myRec = att.records.find(r => r.student.toString() === req.user.id)
      return {
        _id: att._id,
        date: att.date,
        status: myRec?.status || 'absent'
      }
    })
    res.json({ status: 'SUCCESS', data })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Announcements ─────────────────────────────────────────────────────────────
router.get('/announcements', ...guard, async (req, res) => {
  try {
    const anns = await Announcement.find({
      audience: { $in: ['all', 'students'] }
    }).sort({ createdAt: -1 })
    res.json({ status: 'SUCCESS', data: anns })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

module.exports = router
