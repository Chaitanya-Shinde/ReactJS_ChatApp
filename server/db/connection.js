const mongoose = require('mongoose');
const url = 'mongodb+srv://admin_chat_app:'+process.env.MONGO_ATLAS_PASSWORD+'@cluster0.nqys5ag.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('connected to database')
}).catch((e)=> console.log('error', e));