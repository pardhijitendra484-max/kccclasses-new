const router  = require('express').Router()
const Contact = require('../models/Contact')
const { emails } = require('../service/emailSender')

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body
    if (!name || !email || !message)
      return res.status(400).json({ status: 'FAILED', message: 'Name, email and message are required.' })

    // Save to DB
    await Contact.create({ name, email, phone: phone || null, subject: subject || '', message })

    // 📧 Notify admin about new contact form submission
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SENDER_EMAIL
    if (adminEmail) {
      await emails.contactForm(adminEmail, name, email, phone, subject, message)
    }

    res.status(201).json({ status: 'SUCCESS', message: 'Message received! We will get back to you soon.' })
  } catch (err) { res.status(500).json({ status: 'FAILED', message: err.message }) }
})

module.exports = router
