import './Courses.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const CATS = ['All', 'School', 'Entrance', 'Engineering', 'Post-Grad']

const ALL_COURSES = [
  { cat: 'School',      icon: 'fas fa-book',          color: '#6C63FF', title: 'Science & Mathematics',     level: 'Class 9th & 10th',         duration: '12 Months', fee: '₹2,000/mo',  tag: 'Foundation',   highlights: ['CBSE & State Board', 'Chapter-wise tests', 'Doubt sessions', 'Study material'] },
  { cat: 'School',      icon: 'fas fa-calculator',    color: '#22C55E', title: 'Board Exam Excellence',      level: '11th & 12th Standard',      duration: '24 Months', fee: '₹2,500/mo',  tag: 'Board',        highlights: ['PCM & PCB streams', 'PYQ practice', 'Mock exams', 'Result analysis'] },
  { cat: 'Entrance',    icon: 'fas fa-rocket',        color: '#FF6B6B', title: 'JEE Main & Advanced',        level: 'Engineering Entrance',      duration: '18 Months', fee: '₹3,500/mo',  tag: 'Most Popular', highlights: ['Complete JEE syllabus', 'NTA-level tests', 'Rank analysis', '1:1 mentoring'] },
  { cat: 'Entrance',    icon: 'fas fa-heartbeat',     color: '#FFD93D', title: 'NEET Preparation',           level: 'Medical Entrance',          duration: '18 Months', fee: '₹3,000/mo',  tag: 'Medical',      highlights: ['Bio + Chem + Physics', 'NTA mock series', 'NCERT mastery', 'Regular tests'] },
  { cat: 'Engineering', icon: 'fas fa-microchip',     color: '#6C63FF', title: 'BE / B.Tech Coaching',       level: 'All Engineering Branches',  duration: 'Per Sem',   fee: '₹1,500/mo',  tag: 'Technical',    highlights: ['Sem-by-sem guidance', 'Backlog clearance', 'VIVA prep', 'Lab support'] },
  { cat: 'Engineering', icon: 'fas fa-laptop-code',   color: '#FF6B6B', title: 'Crash Course — Engineering', level: 'Exam Season Focus',         duration: '2 Months',  fee: '₹4,000',     tag: 'Intensive',    highlights: ['Exam-focused content', 'Rapid revision', 'Topic-wise tests', 'Formula sheets'] },
  { cat: 'Post-Grad',   icon: 'fas fa-graduation-cap',color: '#22C55E', title: 'MTech / MCA / M.Sc',         level: 'Post-Graduation Level',     duration: 'Per Sem',   fee: '₹2,000/mo',  tag: 'Advanced',     highlights: ['Research methodology', 'Core subject depth', 'Thesis guidance', 'GATE prep'] },
  { cat: 'Entrance',    icon: 'fas fa-bolt',          color: '#6C63FF', title: 'GATE Preparation',           level: 'Engineering PG Entrance',   duration: '12 Months', fee: '₹3,000/mo',  tag: 'PG Entrance',  highlights: ['All branches covered', 'Previous year papers', 'Topic analysis', 'Mock tests'] },
]

export default function Courses() {
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? ALL_COURSES : ALL_COURSES.filter(c => c.cat === active)

  return (
    <div className="courses-page">
      <section className="page-hero">
        <div className="ph-bg"><div className="ph-orb" /></div>
        <div className="container">
          <p className="ph-breadcrumb"><Link to="/">Home</Link> / Courses</p>
          <h1>Our <span>Courses</span></h1>
          <p className="ph-sub">From class 9th to post-graduation — comprehensive coaching for every stage</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Filter Tabs */}
          <div className="filter-tabs" data-aos="fade-up">
            {CATS.map(c => (
              <button key={c} className={`filter-tab${active === c ? ' active' : ''}`} onClick={() => setActive(c)}>{c}</button>
            ))}
          </div>

          {/* Course Grid */}
          <div className="course-list">
            {filtered.map((c, i) => (
              <div key={i} className="crs-card" data-aos="fade-up" data-aos-delay={i * 60}>
                <div className="crs-header" style={{ background: c.color + '12' }}>
                  <div className="crs-icon" style={{ background: c.color + '22', color: c.color }}><i className={c.icon} /></div>
                  <span className="crs-tag" style={{ background: c.color + '18', color: c.color }}>{c.tag}</span>
                </div>
                <div className="crs-body">
                  <h3>{c.title}</h3>
                  <p className="crs-level"><i className="fas fa-layer-group" /> {c.level}</p>
                  <ul className="crs-highlights">
                    {c.highlights.map((h, j) => <li key={j}><i className="fas fa-check" />{h}</li>)}
                  </ul>
                  <div className="crs-footer">
                    <div className="crs-meta">
                      <span><i className="fas fa-clock" />{c.duration}</span>
                      <span className="crs-fee">{c.fee}</span>
                    </div>
                    <Link to="/register" className="btn btn-primary btn-sm">Enroll <i className="fas fa-arrow-right" /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why enroll */}
      <section className="section enroll-why" style={{ background: 'var(--light-bg)' }}>
        <div className="container">
          <div className="text-center" data-aos="fade-up">
            <div className="section-tag"><i className="fas fa-question-circle" /> Why Enroll with KCC</div>
            <h2 className="section-title">Every Course Comes With <span>These Benefits</span></h2>
          </div>
          <div className="benefits-grid" data-aos="fade-up" data-aos-delay="100">
            {[
              { icon: 'fas fa-file-alt',       txt: 'Comprehensive Study Material' },
              { icon: 'fas fa-clipboard-check', txt: 'Regular Tests & Mock Exams' },
              { icon: 'fas fa-comments',        txt: 'Unlimited Doubt Sessions' },
              { icon: 'fas fa-chart-bar',       txt: 'Performance Analytics' },
              { icon: 'fas fa-users',           txt: 'Small Batch (Max 20)' },
              { icon: 'fas fa-video',           txt: 'Recorded Lectures Access' },
            ].map((b, i) => (
              <div key={i} className="benefit-chip">
                <i className={b.icon} />{b.txt}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner" style={{ background: 'linear-gradient(135deg, var(--primary), #3B35B8)', padding: '72px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: '10px', fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800 }}>Ready to Start?</h2>
          <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: '28px', fontSize: '16px' }}>Free demo class available for all new students. No payment required to try!</p>
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-white btn-lg">Book Free Demo <i className="fas fa-arrow-right" /></Link>
            <Link to="/contact"  className="btn btn-outline-white btn-lg"><i className="fas fa-phone-alt" /> Talk to Us</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
