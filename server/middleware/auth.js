const jwt = require('jsonwebtoken')
const getToken = r => r.cookies?.token || r.headers['authorization']?.replace('Bearer ','')
exports.protect = (req,res,next) => {
  const t = getToken(req)
  if(!t) return res.status(401).json({status:'FAILED',message:'Not authorized'})
  try{req.user=jwt.verify(t,process.env.JWT_SECRET);next()}
  catch{res.status(401).json({status:'FAILED',message:'Token expired'})}
}
exports.requireRole = (...roles) => (req,res,next) => {
  if(!req.user||!roles.includes(req.user.role)) return res.status(403).json({status:'FAILED',message:'Access denied'})
  next()
}
