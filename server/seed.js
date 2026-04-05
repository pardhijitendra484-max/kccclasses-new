require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected')

  const UserSchema = new mongoose.Schema({
    name: String, email: { type: String, unique: true },
    password: String, role: String, isActive: { type: Boolean, default: true }
  }, { timestamps: true })
  const User = mongoose.models.User || mongoose.model('User', UserSchema)

  const accounts = [
    { name: 'Omendra Baghele', email: 'admin@kccclasses.com', password: 'Admin@123', role: 'admin' },
    { name: 'Omendra Baghele', email: 'omendra@kccclasses.com', password: 'Teacher@123', role: 'teacher' },
  ]

  for (const a of accounts) {
    const exists = await User.findOne({ email: a.email })
    if (!exists) {
      const hashed = await bcrypt.hash(a.password, 12)
      await User.create({ ...a, password: hashed })
      console.log(`✅ Created ${a.role}: ${a.email}`)
    } else {
      console.log(`⚠️  Already exists: ${a.email}`)
    }
  }

  console.log('\n╔══════════════════════════════════════╗')
  console.log('║     KCC Classes — Default Logins      ║')
  console.log('╠══════════════════════════════════════╣')
  console.log('║ Admin  : admin@kccclasses.com         ║')
  console.log('║ Pass   : Admin@123                    ║')
  console.log('╠══════════════════════════════════════╣')
  console.log('║ Teacher: omendra@kccclasses.com       ║')
  console.log('║ Pass   : Teacher@123                  ║')
  console.log('╚══════════════════════════════════════╝')
  console.log('\n➡  Start: npm run dev')
  console.log('➡  Open : http://localhost:5173\n')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
