import './Home.css'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const STATS = [
  { value: 500,  suffix: '+', label: 'Students Taught' },
  { value: 10,   suffix: '+', label: 'Years Experience' },
  { value: 95,   suffix: '%', label: 'Success Rate' },
  { value: 8,    suffix: '+', label: 'Courses Offered' },
]

const COURSES = [
  { icon: 'fas fa-atom',           color: '#6C63FF', title: 'JEE / NEET',       sub: 'Engineering & Medical Entrance', tag: 'Most Popular', desc: 'Comprehensive preparation for JEE Main, JEE Advanced, and NEET with expert guidance.' },
  { icon: 'fas fa-calculator',     color: '#FF6B6B', title: 'Board Exams',       sub: '10th & 12th Standard',           tag: 'Foundation',    desc: 'Master CBSE/State board concepts with structured learning and regular test series.' },
  { icon: 'fas fa-microchip',      color: '#22C55E', title: 'BE / B.Tech',       sub: 'Engineering Degree Support',     tag: 'Technical',     desc: 'Subject-wise coaching for all engineering branches — semester prep and backlog clearance.' },
  { icon: 'fas fa-flask',          color: '#FFD93D', title: 'Science & Maths',   sub: 'Class 9th & 10th',               tag: 'School',        desc: 'Build a rock-solid foundation with concept-based teaching for 9th and 10th grade.' },
  { icon: 'fas fa-graduation-cap', color: '#FF6B6B', title: 'MTech / PG',        sub: 'Post-Graduation Level',          tag: 'Advanced',      desc: 'Advanced subject guidance for M.Tech, MCA, M.Sc students seeking deep understanding.' },
  { icon: 'fas fa-book-open',      color: '#6C63FF', title: 'Crash Courses',     sub: 'Rapid Revision Programs',        tag: 'Short-Term',    desc: 'Intensive crash courses for upcoming board and entrance exams — focused and fast.' },
]

const FEATURES = [
  { icon: 'fas fa-chalkboard-teacher', title: 'Expert Faculty',      desc: 'Learn from an M.Tech qualified teacher with 10+ years of real classroom experience.' },
  { icon: 'fas fa-laptop',             title: 'Hybrid Learning',     desc: 'Attend classes physically or online — flexible scheduling around your needs.' },
  { icon: 'fas fa-clipboard-check',    title: 'Regular Tests',       desc: 'Weekly tests, mock exams, and performance analysis to track your progress.' },
  { icon: 'fas fa-users',              title: 'Small Batches',       desc: 'Limited seats per batch for personalised attention and maximum impact.' },
  { icon: 'fas fa-book',               title: 'Study Material',      desc: 'Exclusive notes, practice sheets, and curated question banks for every chapter.' },
  { icon: 'fas fa-trophy',             title: 'Proven Results',      desc: '95%+ students improve grades significantly after joining KCC Classes.' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma',   course: 'JEE Advanced 2024',     text: 'Omendra sir\'s teaching style made even the toughest Physics chapters feel simple. I cleared JEE with AIR 2847. Forever grateful!', stars: 5 },
  { name: 'Rahul Verma',    course: 'NEET 2024',             text: 'The personalized attention in small batches made a huge difference. The Biology and Chemistry sessions were exceptional.', stars: 5 },
  { name: 'Anjali Patel',   course: 'B.Tech (Sem 4)',        text: 'I was struggling with DSA and Mathematics. After 3 months with KCC Classes, I not only cleared my backlog but scored 8.5 CGPA!', stars: 5 },
  { name: 'Rohan Mishra',   course: 'Board Exam (12th)',     text: 'From 55% to 89% — that\'s my journey with KCC Classes. The study material and regular tests were game-changers.', stars: 5 },
  { name: 'Sneha Gupta',    course: 'MTech Entrance',        text: 'Sir\'s depth of knowledge in Mathematics and core subjects is unparalleled. Cleared GATE with a great score!', stars: 5 },
]

function Counter({ value, suffix }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const duration = 1800
        const step = (value / duration) * 16
        const timer = setInterval(() => {
          start = Math.min(start + step, value)
          setCount(Math.floor(start))
          if (start >= value) clearInterval(timer)
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="home">

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb1" />
          <div className="hero-orb orb2" />
          <div className="hero-orb orb3" />
          <div className="hero-grid" />
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge" data-aos="fade-down">
              <i className="fas fa-star" /> Rated #1 Coaching in Chandrapur
            </div>
            <h1 data-aos="fade-up" data-aos-delay="100">
              From <span className="hero-grad">9th Grade</span> to<br />
              <span className="hero-grad">Engineering & NEET</span><br />
              — We Build Champions
            </h1>
            <p data-aos="fade-up" data-aos-delay="200">
              Expert coaching by <strong>Omendra Baghele</strong> — M.Tech qualified, 10+ years experience.
              Specialising in JEE, NEET, Board Exams, BE, B.Tech & Post-Graduation.
            </p>
            <div className="hero-actions" data-aos="fade-up" data-aos-delay="300">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Your Journey <i className="fas fa-arrow-right" />
              </Link>
              <Link to="/courses" className="btn btn-outline-hero btn-lg">
                <i className="fas fa-play-circle" /> View Courses
              </Link>
            </div>
            <div className="hero-trust" data-aos="fade-up" data-aos-delay="400">
              <div className="trust-avatars">
                {[1,2,3,4].map(i => <div key={i} className={`avatar av${i}`}>{String.fromCharCode(64+i)}</div>)}
              </div>
              <span><strong>500+</strong> students already enrolled</span>
            </div>
          </div>
          <div className="hero-visual" data-aos="fade-left" data-aos-delay="200">
            <div className="hero-card card-main">
              <div className="hc-header">
                <div className="hc-avatar">OB</div>
                <div>
                  <div className="hc-name">Omendra Baghele</div>
                  <div className="hc-sub">M.Tech | 10+ Years</div>
                </div>
                <span className="hc-live"><i className="fas fa-circle" />Live</span>
              </div>
              <div className="hc-subject">Advanced Mathematics</div>
              <div className="hc-bar"><div className="hc-fill" style={{width:'72%'}} /></div>
              <div className="hc-meta">
                <span><i className="fas fa-users" /> 28 students</span>
                <span><i className="fas fa-clock" /> 1h 20m</span>
              </div>
            </div>
            <div className="hero-card card-stat">
              <i className="fas fa-trophy" style={{color:'#FFD93D',fontSize:'22px'}} />
              <div className="cs-val">95%</div>
              <div className="cs-lbl">Success Rate</div>
            </div>
            <div className="hero-card card-course">
              <div className="cc-dot" />
              <div>
                <div className="cc-title">JEE Main Result</div>
                <div className="cc-sub">3 students → IIT 🎉</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className="stat-item" data-aos="fade-up" data-aos-delay={i * 80}>
                <div className="stat-num"><Counter value={s.value} suffix={s.suffix} /></div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT SNIPPET ─── */}
      <section className="section about-snap">
        <div className="container">
          <div className="about-snap-grid">
            <div className="about-snap-visual" data-aos="fade-right">
              <div className="teacher-card">
                <div className="teacher-img">
                  <div className="teacher-initials">OB</div>
                </div>
                <div className="teacher-info">
                  <div className="teacher-badges">
                    <span className="badge badge-primary"><i className="fas fa-graduation-cap" /> M.Tech</span>
                    <span className="badge badge-accent"><i className="fas fa-award" /> B.E.</span>
                  </div>
                  <h3>Omendra Baghele</h3>
                  <p>Founder & Lead Instructor, KCC Classes</p>
                  <div className="exp-row">
                    <div className="exp-item"><span>10+</span><small>Years Exp.</small></div>
                    <div className="exp-item"><span>500+</span><small>Students</small></div>
                    <div className="exp-item"><span>95%</span><small>Success</small></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-snap-content" data-aos="fade-left">
              <div className="section-tag"><i className="fas fa-user-tie" /> Meet Your Mentor</div>
              <h2 className="section-title">A Decade of <span>Transforming</span> Students</h2>
              <p className="section-sub">
                Omendra Baghele holds an M.Tech degree and has dedicated over 10 years to making complex subjects
                simple and accessible — from 9th standard to post-graduation level.
              </p>
              <ul className="check-list">
                <li><i className="fas fa-check-circle" /> Expert in Mathematics, Physics & Core Engineering</li>
                <li><i className="fas fa-check-circle" /> Specialized JEE, NEET & Board Exam coaching</li>
                <li><i className="fas fa-check-circle" /> BE, B.Tech & MTech subject mentoring</li>
                <li><i className="fas fa-check-circle" /> Personalized guidance for every student</li>
              </ul>
              <Link to="/about" className="btn btn-primary">Know More About Sir <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COURSES ─── */}
      <section className="section courses-snap">
        <div className="container">
          <div className="text-center" data-aos="fade-up">
            <div className="section-tag"><i className="fas fa-book-open" /> What We Teach</div>
            <h2 className="section-title">Courses for Every <span>Stage of Learning</span></h2>
            <p className="section-sub">From school foundation to competitive entrance exams and post-graduation — KCC Classes covers it all.</p>
          </div>
          <div className="courses-grid" data-aos="fade-up" data-aos-delay="100">
            {COURSES.map((c, i) => (
              <div key={i} className="course-card">
                <div className="course-icon" style={{ background: c.color + '18', color: c.color }}>
                  <i className={c.icon} />
                </div>
                <span className="course-tag" style={{ background: c.color + '15', color: c.color }}>{c.tag}</span>
                <h3>{c.title}</h3>
                <p className="course-sub">{c.sub}</p>
                <p className="course-desc">{c.desc}</p>
                <Link to="/courses" className="course-link">Learn More <i className="fas fa-arrow-right" /></Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8" data-aos="fade-up">
            <Link to="/courses" className="btn btn-outline">View All Courses <i className="fas fa-arrow-right" /></Link>
          </div>
        </div>
      </section>

      {/* ─── WHY KCC ─── */}
      <section className="section why-kcc">
        <div className="container">
          <div className="text-center" data-aos="fade-up">
            <div className="section-tag"><i className="fas fa-star" /> Why KCC Classes</div>
            <h2 className="section-title">What Makes Us <span>Different</span></h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" data-aos="fade-up" data-aos-delay={i * 70}>
                <div className="feature-icon"><i className={f.icon} /></div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="section testimonials">
        <div className="container">
          <div className="text-center" data-aos="fade-up">
            <div className="section-tag"><i className="fas fa-comment-dots" /> Student Success Stories</div>
            <h2 className="section-title">What Our <span>Students Say</span></h2>
          </div>
          <div className="testimonial-slider" data-aos="fade-up" data-aos-delay="100">
            <div className="testimonial-track">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={`testimonial-card${i === activeTestimonial ? ' active' : ''}`}>
                  <div className="stars">{[...Array(t.stars)].map((_, j) => <i key={j} className="fas fa-star" />)}</div>
                  <p>"{t.text}"</p>
                  <div className="t-author">
                    <div className="t-avatar">{t.name.charAt(0)}</div>
                    <div><strong>{t.name}</strong><span>{t.course}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="t-dots">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} className={i === activeTestimonial ? 'active' : ''} onClick={() => setActiveTestimonial(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="cta-banner" data-aos="fade-up">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Ready to Transform Your Academic Journey?</h2>
              <p>Join 500+ students who have achieved their dreams with KCC Classes. Seats are limited!</p>
            </div>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-white btn-lg">Enroll Now — Free Trial <i className="fas fa-arrow-right" /></Link>
              <a href="tel:+919665228375" className="btn btn-outline-white btn-lg">
                <i className="fas fa-phone-alt" /> Call Us Now
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
