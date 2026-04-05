import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="f-logo-icon"><i className="fas fa-graduation-cap" /></div>
                <span>KCC <span>Classes</span></span>
              </Link>
              <p>Expert coaching for 9th to Engineering, NEET, JEE & Post-Graduation by Omendra Baghele — 10+ years of proven results.</p>
              <div className="social-links">
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
                <a href="#" aria-label="YouTube"><i className="fab fa-youtube" /></a>
                <a href="#" aria-label="WhatsApp"><i className="fab fa-whatsapp" /></a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/courses">Courses</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/login">Student Login</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Courses</h4>
              <ul>
                <li><Link to="/courses">JEE & Engineering</Link></li>
                <li><Link to="/courses">NEET Preparation</Link></li>
                <li><Link to="/courses">Board Exam (10th/12th)</Link></li>
                <li><Link to="/courses">BE / B.Tech Support</Link></li>
                <li><Link to="/courses">MTech / Post-Grad</Link></li>
                <li><Link to="/courses">Science & Maths (9th)</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact</h4>
              <ul className="contact-list">
                <li><i className="fas fa-map-marker-alt" /><span>KCC Classes, Chandrapur, Maharashtra</span></li>
                <li><i className="fas fa-phone" /><a href="tel:+919876543210">+91 98765 43210</a></li>
                <li><i className="fas fa-envelope" /><a href="mailto:omendra@kccclasses.com">omendra@kccclasses.com</a></li>
                <li><i className="fas fa-clock" /><span>Mon–Sat: 7 AM – 9 PM</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {year} KCC Classes by Omendra Baghele. All rights reserved.</p>
          <p>Built with ❤️ for students who dare to dream big.</p>
        </div>
      </div>
    </footer>
  )
}
