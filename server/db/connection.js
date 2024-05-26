const mongoose = require('mongoose');
const dotenv = require('dotenv').config()

const mongoPass = process.env.MONGO_ATLAS_PASSWORD
console.log("pass is", mongoPass);
const url = 'mongodb+srv://chatApp_admin:'+ mongoPass +'@cluster0.nqys5ag.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('connected to database')
}).catch((e)=> console.log('error', e));