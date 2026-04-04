import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px 20px' }}>
      <div style={{ fontSize:'120px', fontWeight:900, color:'var(--primary)', lineHeight:1, fontFamily:'Poppins,sans-serif' }}>404</div>
      <h2 style={{ fontSize:'28px', fontWeight:800, margin:'16px 0 10px' }}>Page Not Found</h2>
      <p style={{ color:'var(--text-light)', marginBottom:'28px', maxWidth:'400px' }}>The page you're looking for doesn't exist. Let's get you back on track.</p>
      <Link to="/" className="btn btn-primary btn-lg">Go Back Home</Link>
    </div>
  )
}
