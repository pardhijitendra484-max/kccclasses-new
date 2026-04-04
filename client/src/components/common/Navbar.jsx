import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`} ref={menuRef}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-icon"><i className="fas fa-graduation-cap" /></div>
          <span className="logo-text">KCC <span>Classes</span></span>
        </Link>

        <nav className="nav-links">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-cta">
          <Link to="/login" className="btn-nav-login">Login</Link>
          <Link to="/register" className="btn-nav-join">Enroll Now <i className="fas fa-arrow-right" /></Link>
        </div>

        <button className={`hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </div>

      <div className={`mobile-menu${menuOpen ? ' show' : ''}`}>
        {NAV_LINKS.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => 'mobile-link' + (isActive ? ' active' : '')} end={l.to === '/'}>
            {l.label}
          </NavLink>
        ))}
        <div className="mobile-actions">
          <Link to="/login" className="btn-nav-login">Login</Link>
          <Link to="/register" className="btn-nav-join">Enroll Now</Link>
        </div>
      </div>
    </header>
  )
}
