const mongoose = require('mongoose')
module.exports=mongoose.model('Contact',new mongoose.Schema({name:String,email:String,phone:String,subject:String,message:String,read:{type:Boolean,default:false}},{timestamps:true}))
