const mongoose=require('mongoose')
const LoginSchema=mongoose.Schema({
    email:String,
    password:String,
    confirmPassword:String
})

const LoginModel=new mongoose.model("logins",LoginSchema);
module.exports=LoginModel;
