import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return toast.error('Please fill all required fields.')
    setLoading(true)
    try {
      await axios.post('/api/contact', form)
      toast.success('Message sent! We\'ll reply within 24 hours.')
      setForm({ name:'', email:'', phone:'', subject:'', message:'' })
    } catch (err) {
      toast.error('Failed to send. Please try again or call us directly.')
    } finally { setLoading(false) }
  }

  return (
    <div className="contact-page">
      <section className="page-hero">
        <div className="ph-bg"><div className="ph-orb" /></div>
        <div className="container">
          <p className="ph-breadcrumb"><Link to="/">Home</Link> / Contact</p>
          <h1>Get in <span>Touch</span></h1>
          <p className="ph-sub">Have a question or want to enroll? We'd love to hear from you.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Info Side */}
            <div className="contact-info" data-aos="fade-right">
              <h3>Contact Information</h3>
              <p>Reach out to us through any channel below and we'll get back to you as soon as possible.</p>
              <div className="info-items">
                <div className="info-item"><div className="info-icon"><i className="fas fa-map-marker-alt" /></div><div><strong>Visit Us</strong><span>KCC Classes, Chandrapur, Maharashtra, India</span></div></div>
                <div className="info-item"><div className="info-icon"><i className="fas fa-phone-alt" /></div><div><strong>Call Us</strong><a href="tel:+919876543210">+91 98765 43210</a></div></div>
                <div className="info-item"><div className="info-icon"><i className="fas fa-envelope" /></div><div><strong>Email Us</strong><a href="mailto:omendra@kccclasses.com">omendra@kccclasses.com</a></div></div>
                <div className="info-item"><div className="info-icon"><i className="fas fa-clock" /></div><div><strong>Timings</strong><span>Mon–Sat: 7:00 AM – 9:00 PM<br/>Sunday: 9:00 AM – 1:00 PM</span></div></div>
              </div>
              <div className="social-row">
                <a href="#" className="s-btn"><i className="fab fa-whatsapp" />WhatsApp</a>
                <a href="#" className="s-btn"><i className="fab fa-instagram" />Instagram</a>
                <a href="#" className="s-btn"><i className="fab fa-youtube" />YouTube</a>
              </div>
              <div className="map-box"><i className="fas fa-map-marked-alt" /><span>Chandrapur, Maharashtra</span></div>
            </div>

            {/* Form Side */}
            <div className="contact-form-wrap" data-aos="fade-left">
              <h3>Send a Message</h3>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Your full name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="Your email" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select name="subject" value={form.subject} onChange={handleChange} className="form-input">
                      <option value="">— Select Topic —</option>
                      <option>Course Enquiry</option>
                      <option>Admission / Enrollment</option>
                      <option>Fee Structure</option>
                      <option>Free Demo Class</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} className="form-input" rows="5" placeholder="Write your message..." required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                  {loading ? <><span className="btn-spinner" /> Sending...</> : <><i className="fas fa-paper-plane" /> Send Message</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
