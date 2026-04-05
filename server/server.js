const express      = require('express')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const path         = require('path')
const fs           = require('fs')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const connectDB = require('./config/database')
const app = express()
connectDB()

// ── CORS — allow all origins in production (Railway handles domain security) ─
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/admin',   require('./routes/admin'))
app.use('/api/teacher', require('./routes/teacher'))
app.use('/api/student', require('./routes/student'))

// ── Serve React Build ─────────────────────────────────────────────────────────
// Checks if dist folder exists — works regardless of NODE_ENV value
const distPath  = path.join(__dirname, '../client/dist')
const indexFile = path.join(distPath, 'index.html')

if (fs.existsSync(indexFile)) {
  app.use(express.static(distPath))
  // All non-API routes go to React (handles React Router client-side routing)
  app.get(/^(?!\/api).*$/, (_req, res) => res.sendFile(indexFile))
  console.log('✅ Serving React build from client/dist')
} else {
  app.get('/', (_req, res) => {
    res.status(200).send(`
      <h2>KCC Classes API is running ✅</h2>
      <p style="color:red">⚠️  React build not found at client/dist</p>
      <p>Fix: Make sure Railway runs <strong>npm run build</strong> before <strong>npm start</strong></p>
    `)
  })
  console.warn('⚠️  client/dist/index.html not found — run: npm run build')
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`\n🚀 KCC Server running on port ${PORT}\n`))
