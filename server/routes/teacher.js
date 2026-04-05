const router      = require('express').Router()
const { protect, requireRole } = require('../middleware/auth')
const User         = require('../models/User')
const Homework     = require('../models/Homework')
const Attendance   = require('../models/Attendance')
const Test         = require('../models/Test')
const Announcement = require('../models/Announcement')
const { emails }   = require('../service/emailSender')

const guard = [protect, requireRole('teacher','admin')]

// ── Dashboard stats ──────────────────────────────────────────────────────────
router.get('/dashboard', ...guard, async (req, res) => {
  try {
    const mongoose = require('mongoose')
    const oid = new mongoose.Types.ObjectId(req.user.id)
    const [hwCount, studentCount, testCount, subAgg] = await Promise.all([
      Homework.countDocuments({ assignedBy: req.user.id }),
      User.countDocuments({ role: 'student' }),
      Test.countDocuments({ teacher: req.user.id }),
      Homework.aggregate([
        { $match: { assignedBy: oid } },
        { $project: { subCount: { $size: '$submissions' } } },
        { $group: { _id: null, total: { $sum: '$subCount' } } }
      ])
    ])
    res.json({ status: 'SUCCESS', data: { hwCount, studentCount, testCount, totalSubmissions: subAgg[0]?.total || 0 } })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Homework ─────────────────────────────────────────────────────────────────
router.get('/homework', ...guard, async (req, res) => {
  try {
    const hw = await Homework.find({ assignedBy: req.user.id }).sort({ createdAt: -1 })
    res.json({ status: 'SUCCESS', data: hw })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.post('/homework', ...guard, async (req, res) => {
  try {
    const { title, subject, description, dueDate, priority, course } = req.body
    if (!title || !subject || !description || !dueDate)
      return res.status(400).json({ status: 'FAILED', message: 'Fill all required fields' })
    const hw = await Homework.create({
      title, subject, description,
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      course: course || null,
      assignedBy: req.user.id,
      assignedByName: req.user.name
    })
    // 📧 Notify ALL students about new homework
    const students = await User.find({ role: 'student', isActive: true }).select('name email')
    for (const s of students) {
      emails.homeworkAssigned(s.email, s.name, hw)
    }
    res.status(201).json({ status: 'SUCCESS', data: hw, notified: students.length })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.delete('/homework/:id', ...guard, async (req, res) => {
  try { await Homework.findByIdAndDelete(req.params.id); res.json({ status: 'SUCCESS' }) }
  catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// Grade a submission — notify the student
router.put('/homework/:hwId/grade/:studentId', ...guard, async (req, res) => {
  try {
    const hw = await Homework.findById(req.params.hwId)
    if (!hw) return res.status(404).json({ status: 'FAILED', message: 'Not found' })
    const sub = hw.submissions.find(s => s.student.toString() === req.params.studentId)
    if (!sub) return res.status(404).json({ status: 'FAILED', message: 'Submission not found' })
    sub.grade = req.body.grade
    await hw.save()
    // 📧 Notify student their homework was graded
    const student = await User.findById(req.params.studentId).select('name email')
    if (student?.email) {
      emails.homeworkGraded(student.email, student.name, hw, req.body.grade, req.body.note || '')
    }
    res.json({ status: 'SUCCESS' })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Attendance ────────────────────────────────────────────────────────────────
router.get('/attendance', ...guard, async (req, res) => {
  try {
    const records = await Attendance.find({ markedBy: req.user.id }).sort({ date: -1 }).limit(90)
    res.json({ status: 'SUCCESS', data: records })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.post('/attendance', ...guard, async (req, res) => {
  try {
    const { date, records } = req.body
    if (!date || !records?.length)
      return res.status(400).json({ status: 'FAILED', message: 'Date and records required' })
    const dateObj = new Date(date)
    dateObj.setHours(0,0,0,0)

    let att = await Attendance.findOne({
      markedBy: req.user.id,
      date: { $gte: dateObj, $lt: new Date(dateObj.getTime() + 86400000) }
    })
    if (att) { att.records = records; await att.save() }
    else { att = await Attendance.create({ date: dateObj, markedBy: req.user.id, records }) }

    const p = records.filter(r => r.status === 'present').length
    const totalClasses = await Attendance.countDocuments({ 'records.student': { $exists: true }, markedBy: req.user.id })

    // 📧 Notify each student their attendance for today
    for (const record of records) {
      const student = await User.findById(record.studentId || record.student).select('name email')
      if (!student?.email) continue
      // Calculate this student's overall stats
      const allAtt = await Attendance.find({ 'records.student': student._id })
      let present = 0, total = 0
      for (const a of allAtt) {
        const r = a.records.find(x => x.student?.toString() === student._id.toString())
        if (r) { total++; if (r.status === 'present') present++ }
      }
      const pct = total ? Math.round((present / total) * 100) : 0
      emails.attendanceSummary(student.email, student.name, dateObj, record.status, req.user.name, { present, total, pct })
    }

    res.json({ status: 'SUCCESS', message: `Attendance saved! ${p}/${records.length} present`, data: att })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Tests ─────────────────────────────────────────────────────────────────────
router.get('/tests', ...guard, async (req, res) => {
  try {
    const tests = await Test.find({ teacher: req.user.id }).sort({ createdAt: -1 })
    res.json({ status: 'SUCCESS', data: tests })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.post('/tests', ...guard, async (req, res) => {
  try {
    const { title, subject, date, maxMarks, duration } = req.body
    if (!title || !subject || !date)
      return res.status(400).json({ status: 'FAILED', message: 'Fill required fields' })
    const t = await Test.create({
      title, subject, date: new Date(date),
      maxMarks: maxMarks || 100, duration: duration || '',
      teacher: req.user.id
    })
    res.status(201).json({ status: 'SUCCESS', data: t })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.delete('/tests/:id', ...guard, async (req, res) => {
  try { await Test.findByIdAndDelete(req.params.id); res.json({ status: 'SUCCESS' }) }
  catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// Enter results — 📧 notify each student with their grade
router.post('/tests/:testId/results', ...guard, async (req, res) => {
  try {
    const { results } = req.body
    const test = await Test.findById(req.params.testId)
    if (!test) return res.status(404).json({ status: 'FAILED', message: 'Test not found' })

    for (const r of results) {
      const pct = (r.marks / test.maxMarks) * 100
      let grade = 'F'
      if      (pct >= 90) grade = 'A+'
      else if (pct >= 80) grade = 'A'
      else if (pct >= 70) grade = 'B+'
      else if (pct >= 60) grade = 'B'
      else if (pct >= 50) grade = 'C'
      else if (pct >= 35) grade = 'D'

      const existing = test.results.find(x => x.student.toString() === r.studentId)
      if (existing) { existing.marks = r.marks; existing.grade = grade }
      else test.results.push({ student: r.studentId, studentName: r.studentName, marks: r.marks, grade })

      // 📧 Email each student their individual result
      const student = await User.findById(r.studentId).select('name email')
      if (student?.email) {
        emails.testResult(student.email, student.name, test, r.marks, grade)
      }
    }
    await test.save()
    res.json({ status: 'SUCCESS', data: test })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Announcements ─────────────────────────────────────────────────────────────
router.get('/announcements', ...guard, async (req, res) => {
  try {
    const anns = await Announcement.find({ postedBy: req.user.id }).sort({ createdAt: -1 })
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
      postedBy: req.user.id, postedByName: req.user.name, postedByRole: req.user.role
    })
    // 📧 Email relevant recipients
    const roleFilter = audience === 'students' ? { role: 'student' } : { role: { $in: ['student', 'teacher'] } }
    const recipients = await User.find({ ...roleFilter, isActive: true }).select('name email')
    for (const u of recipients) {
      emails.announcement(u.email, u.name, a, req.user.name, 'Teacher')
    }
    res.status(201).json({ status: 'SUCCESS', data: a, notified: recipients.length })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

router.delete('/announcements/:id', ...guard, async (req, res) => {
  try { await Announcement.findByIdAndDelete(req.params.id); res.json({ status: 'SUCCESS' }) }
  catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

// ── Students ──────────────────────────────────────────────────────────────────
router.get('/students', ...guard, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ name: 1 })
    res.json({ status: 'SUCCESS', data: students })
  } catch (e) { res.status(500).json({ status: 'FAILED', message: e.message }) }
})

module.exports = router
