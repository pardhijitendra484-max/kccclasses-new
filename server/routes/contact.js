const router = require("express").Router();
const Contact = require("../models/Contact");
const { sendEmail, emailTemplates } = require("../service/emailSender");

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message)
      return res
        .status(400)
        .json({ status: "FAILED", message: "Required fields missing." });
    await Contact.create({ name, email, phone, subject, message });
  
      const ok = await sendEmail(
        email,
       subject,
        emailTemplates.contactMessage(
         name, email, phone, subject, message
        ),
      );
      
    
    res.json({
      status: "SUCCESS",
      message: "Message sent! We will reply within 24 hours.",
    });
  } catch (err) {
    res.status(500).json({ status: "FAILED", message: err.message });
  }
});
module.exports = router;
