const router = require('express').Router()
const {protect,requireRole} = require('../middleware/auth')
router.get('/dashboard', protect, (req,res) => res.json({status:'SUCCESS',user:req.user}))
module.exports = router
