const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const {protect} = require('../middleware/auth')
const sign = u => jwt.sign({id:u._id,name:u.name,email:u.email,role:u.role},process.env.JWT_SECRET,{expiresIn:'8h'})

router.post('/register', async (req,res) => {
  try {
    const {name,email,password,confirm_password,role,course,phone} = req.body
    if(!name||!email||!password) return res.status(400).json({status:'FAILED',message:'Name, email, password required.'})
    if(password!==confirm_password) return res.status(400).json({status:'FAILED',message:'Passwords do not match.'})
    if(await User.findOne({email})) return res.status(409).json({status:'FAILED',message:'Email already registered.'})
    const u = await User.create({name,email,password,role:role||'student',course:course||null,phone:phone||null})
    res.status(201).json({status:'SUCCESS',message:'Account created! You can now login.',data:{id:u._id,name:u.name,role:u.role}})
  } catch(err){res.status(500).json({status:'FAILED',message:err.message})}
})

router.post('/login', async (req,res) => {
  try {
    const {email,password,role} = req.body
    const u = await User.findOne({email})
    if(!u||!(await u.comparePassword(password))) return res.status(401).json({status:'FAILED',message:'Invalid email or password.'})
    if(role&&u.role!==role) return res.status(403).json({status:'FAILED',message:'Account registered as '+u.role+'.'})
    if(!u.isActive) return res.status(403).json({status:'FAILED',message:'Account deactivated.'})
    u.lastLogin=new Date(); await u.save()
    const token=sign(u)
    res.cookie('token',token,{httpOnly:true,maxAge:8*60*60*1000,sameSite:'Lax'})
    res.json({status:'SUCCESS',token,redirect:'/'+u.role+'/dashboard',data:{id:u._id,name:u.name,email:u.email,role:u.role}})
  } catch(err){res.status(500).json({status:'FAILED',message:err.message})}
})

router.get('/me', protect, async (req,res) => {
  const u = await User.findById(req.user.id).select('-password')
  res.json({status:'SUCCESS',data:u})
})
router.get('/logout', (req,res) => {res.clearCookie('token');res.json({status:'SUCCESS'})})
module.exports = router
