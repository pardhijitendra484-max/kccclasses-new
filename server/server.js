const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const connectDB = require('./config/database')
const app = express()
connectDB()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:8080', credentials: true }))

// API Routes
app.use('/api/auth',    require('./routes/auth'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/admin',   require('./routes/admin'))
app.use('/api/teacher', require('./routes/teacher'))
app.use('/api/student', require('./routes/student'))

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')))
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`\n🚀 KCC Server → http://localhost:${PORT}\n`))
