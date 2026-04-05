import './About.css'
import { Link } from 'react-router-dom'

const TIMELINE = [
  { year: '2014', title: 'KCC Classes Founded', desc: 'Started with a small batch of 10 students from a humble setup in Chandrapur.' },
  { year: '2016', title: 'First JEE Success', desc: '3 students cleared JEE Main in the first batch — confirming the teaching methodology works.' },
  { year: '2018', title: 'Expanded to Engineering Courses', desc: 'Added BE/B.Tech semester coaching and began helping engineering college students.' },
  { year: '2020', title: 'Online Classes Launched', desc: 'Pivoted to hybrid model during the pandemic. 200+ students enrolled online.' },
  { year: '2022', title: 'MTech & PG Coaching Added', desc: 'Introduced post-graduation level coaching for GATE, M.Tech subjects.' },
  { year: '2024', title: '500+ Students Milestone', desc: 'Celebrated 500+ students coached. 95%+ pass rate and counting.' },
]

const QUALS = [
  { icon: 'fas fa-graduation-cap', title: 'M.Tech (Master of Technology)', sub: 'Post-Graduate Degree — Core Engineering Specialization', color: '#6C63FF' },
  { icon: 'fas fa-university',     title: 'B.E. (Bachelor of Engineering)', sub: 'Under-Graduate Engineering Degree',                     color: '#FF6B6B' },
  { icon: 'fas fa-atom',           title: 'Physics & Mathematics Expert',   sub: 'Specialist in JEE/NEET level problems',                  color: '#22C55E' },
  { icon: 'fas fa-laptop-code',    title: 'Technical Engineering Subjects', sub: 'Mentor for all core engineering branches',               color: '#FFD93D' },
]

export default function About() {
  return (
    <div className="about-page">
      {/* Page Header */}
      <section className="page-hero">
        <div className="ph-bg"><div className="ph-orb" /></div>
        <div className="container">
          <p className="ph-breadcrumb"><Link to="/">Home</Link> / About Us</p>
          <h1>About <span>KCC Classes</span></h1>
          <p className="ph-sub">A decade of shaping academic futures — from 9th grade to post-graduation</p>
        </div>
      </section>

      {/* Teacher Section */}
      <section className="section">
        <div className="container">
          <div className="teacher-profile-grid">
            <div className="tp-visual" data-aos="fade-right">
              <div className="tp-card">
                <div className="tp-avatar">OB</div>
                <div className="tp-shine" />
              </div>
              <div className="tp-badge-exp">10+<br/><small>Years</small></div>
              <div className="tp-badge-students">500+<br/><small>Students</small></div>
            </div>
            <div className="tp-content" data-aos="fade-left">
              <div className="section-tag"><i className="fas fa-user-tie" /> Your Mentor</div>
              <h2 className="section-title">Omendra <span>Baghele</span></h2>
              <p className="tp-headline">M.Tech | B.E. | 10+ Years of Excellence in Teaching</p>
              <p>Omendra Baghele is the founder and lead instructor of KCC Classes. Holding an M.Tech degree and rich undergraduate engineering background, he has spent over a decade transforming the way students understand complex subjects.</p>
              <p>His teaching approach blends conceptual depth with real-world application — making even the toughest topics in Mathematics, Physics, Chemistry, and Engineering understandable for every student, from 9th graders to post-graduates.</p>
              <div className="qual-grid">
                {QUALS.map((q, i) => (
                  <div key={i} className="qual-item">
                    <div className="qual-icon" style={{ background: q.color + '18', color: q.color }}><i className={q.icon} /></div>
                    <div><div className="qual-title">{q.title}</div><div className="qual-sub">{q.sub}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section philosophy" style={{ background: 'var(--light-bg)' }}>
        <div className="container">
          <div className="text-center" data-aos="fade-up">
            <div className="section-tag"><i className="fas fa-lightbulb" /> Our Philosophy</div>
            <h2 className="section-title">Teaching That <span>Transforms</span></h2>
          </div>
          <div className="phil-grid" data-aos="fade-up" data-aos-delay="100">
            <div className="phil-card">
              <i className="fas fa-brain" />
              <h4>Concept First, Formula Later</h4>
              <p>We build deep conceptual understanding before memorisation, creating students who can solve any problem — seen or unseen.</p>
            </div>
            <div className="phil-card">
              <i className="fas fa-heart" />
              <h4>Every Student Matters</h4>
              <p>Small batches ensure no student is left behind. Personalised attention and doubt-clearing sessions are non-negotiable.</p>
            </div>
            <div className="phil-card">
              <i className="fas fa-chart-line" />
              <h4>Progress Tracking Always</h4>
              <p>Regular tests, performance analysis, and parent communication ensure continuous improvement and accountability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <div className="text-center" data-aos="fade-up">
            <div className="section-tag"><i className="fas fa-history" /> Our Journey</div>
            <h2 className="section-title">10 Years of <span>Milestones</span></h2>
          </div>
          <div className="timeline" data-aos="fade-up" data-aos-delay="100">
            {TIMELINE.map((t, i) => (
              <div key={i} className={`tl-item${i % 2 === 0 ? ' left' : ' right'}`}>
                <div className="tl-content">
                  <span className="tl-year">{t.year}</span>
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
                <div className="tl-dot" />
              </div>
            ))}
            <div className="tl-line" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner" style={{ background: 'linear-gradient(135deg, var(--dark), #1E1A3A)' }}>
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2 style={{ color: '#fff' }}>Start Learning with the Best</h2>
              <p style={{ color: 'rgba(255,255,255,.7)' }}>Join KCC Classes today and experience the difference expert teaching makes.</p>
            </div>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Enroll Now <i className="fas fa-arrow-right" /></Link>
              <Link to="/contact" className="btn btn-outline-white btn-lg"><i className="fas fa-envelope" /> Get in Touch</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
