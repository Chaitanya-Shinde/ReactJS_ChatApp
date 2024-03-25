const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const io = require('socket.io')(8002,{
    cors:{
        origin: "http://localhost:3000"
    }
});


app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

//socket.io
let users = []
io.on('connection', socket=>{
    socket.on('addUser', userId=>{
        const isUserExist = users.find(user=>user.userId == userId);
        if(!isUserExist){
            const user = { userId, socketId: socket.id};
            users.push(user)
            io.emit('getUsers', users); //io.emit will broadcast data to all users and socket.emit will broadcast data to that connected user
        }
        
    });
    //console.log('user connected', socket.id);
    socket.on('sendMessage', async ({senderId, receiverId, message, conversationId})=>{
        console.log("RECEIVER ID IS:", receiverId)
        console.log("SENDER ID IS:", senderId)
        const receiver =  users.find(user=> user.userId === receiverId);
        const sender =  users.find(user=> user.userId === senderId);
        const user = await Users.findById(senderId);
        if(receiver){
            console.log("SENDER",sender)
            console.log("SENDER SOCKET ID",sender.socketId)
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage',{
                senderId,
                receiverId,
                message,
                conversationId,
                user: {id: user._id, userName: user.userName, email: user.email}

            })
        }else{
            io.to(sender.socketId).emit('getMessage',{
                senderId,
                receiverId,
                message,
                conversationId,
                user: {id: user._id, userName: user.userName, email: user.email}

            })
        }
    })

    socket.on('disconnect', ()=>{
        users = users.filter(user=>{user.socketId !== socket.id});
        io.emit('getUsers', users);
    })
});

//db connection
require('./db/connection.js');

//imports
const Users = require('./models/Users.js');
const Conversation = require('./models/Conversations.js');
const Messages = require('./models/Messages.js');

const port = process.env.PORT || 8000

app.get('/', (req,res,next)=>{
    res.send('welcome')
})

//register new user
app.post('/api/register', async (req,res,next)=>{
    try{
        const {userName, email, password, confirmPassword}= req.body;
        if(!userName || !email || !password){
            res.status(400).send("Please enter all details");
        }else{
            //check if user exists
            const alreadyExists = await Users.findOne({email});
            if(alreadyExists){
                res.status(400).send('user already exists');
            }else{
                const newUser = new Users({ userName, email })
                //encrypt user password
                bcryptjs.hash(password, 10, (err,hashedPassword)=>{
                    newUser.set('password', hashedPassword);
                    newUser.save();
                    next();
                })
                return res.status(200).json({message:'user registered successfully'})
            }

        }
    }catch(error){
        console.log(error, 'Error');
    }

})

//login user
app.post('/api/login', async(req,res,next)=>{
    try{
        const {email, password} = req.body;
        //check if details are correct
        if(!email || !password){
            res.status(400).send("Please fill all the details")
        }else{
            const user = await Users.findOne({email});
            //check if user exists
            if(!user){
                
                res.status(400).send('user not found');

            }else{
                //user validation
                const validateUser = await bcryptjs.compare(password, user.password)
                if(!validateUser){
                    res.status(400).send('email or password is incorrect');
                }else{
                    const payload = {
                        userId: user._id,
                        email: user.email,
                    }
                    //assign token to user for 1 day.
                    //TODO check if token has expired or not and redirect user respectively
                    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "THIS_IS_A_JWT_SECRET_KEY";
                    jwt.sign(payload, JWT_SECRET_KEY, {expiresIn: 86400}, async(err,token)=>{
                        await Users.updateOne({_id: user._id},{
                            $set:{token}
                        })
                        user.save();
                        return res.status(200).json({ user:{ id: user._id, userName: user.userName, email: user.email} , token: token })
                    })
                }
            }
        }
    }catch(error){
        console.log(error, 'Error');
    }
})

//create new conversation between sender and receiver
app.post("/api/conversation", async(req,res,next)=>{
    try {
        const { senderId, receiverId}= req.body;
        const newConversation = new Conversation({members:[senderId,receiverId]});
        await newConversation.save();
        res.status(200).send("conversation created successfully");
    } catch (error) {
        console.log(error, "Error")
    }
})

//get all conversations of that user with this userId
app.get("/api/conversation/:userId", async(req,res,next)=>{
    try {
        const userId = req.params.userId;
        const conversation = await Conversation.find({members:{$in:[userId]}})
        const conversationUserData = Promise.all(conversation.map(async(conversation)=>{
            const receiverId =  conversation.members.find((member)=>member !== userId)
            const user = await Users.findById(receiverId);
            return {
                user:{
                    receiverId: user._id,
                    userName: user.userName,
                    email: user.email,
                },
                conversationId: conversation._id
            }
        }))
        res.status(200).json(await conversationUserData);
    } catch (error) {
        console.log(error,'Error');
    }
})

//create and send message
app.post("/api/message",async(req,res,next)=>{
    try {
        const {conversationId, senderId, message , receiverId =''}=req.body;
        //console.log(conversationId, senderId, message, receiverId)
        if(!senderId || !message) return res.status(400).send('please enter all details');
        //if new conversation then create new conversation and then create and send message
        if(conversationId ==="new" && receiverId) {
            const newConversation = new Conversation ({members: [senderId, receiverId]});
            await newConversation.save();
            const newMessage = new Messages({ conversationId: newConversation._id, senderId, message});
            await newMessage.save();
            return res.status(200).send('created new conversation and message sent successfully');
        }else if(!conversationId && !receiverId){
            return res.status(400).send('please enter all details');
        }
    
        const newMessage = new Messages({conversationId, senderId, message});
        await newMessage.save();
        res.status(200).send("message sent successfully");
    } catch (error) {
        console.log(error, "Error")
    }
})


app.get('/api/message/:conversationId', async (req,res,next)=>{
    try {
        //method to fetch all messages of that conversation id and the sender user
        const checkMessages = async (conversationId)=>{
            
            const messages = await Messages.find({conversationId});
            const messageUserData = Promise.all(messages.map(async(message)=>{
                //console.log("message",message.senderId) 
                const user = await Users.findById(message.senderId);
                //console.log("fetching messages from", conversationId)
                return {
                    user:{
                        id: user._id,
                        userName: user.userName,
                        email: user.email
                    },
                    message: message.message
                }
            }))
            res.status(200).json(await messageUserData) 
        }
        //if we are creating new conversation then check all the conversations which include the sender's and receiver's Id and then return the first conversation from the array
        const conversationId = req.params.conversationId;
        if(conversationId === "new") {
            const checkConversationId = await Conversation.find({members:{ $all:[req.query.senderId, req.query.receiverId]}});
            if(checkConversationId.length>0) {
                //console.log("convo id",checkConversationId[0]._id)
                checkMessages(checkConversationId[0]._id)
            }else{
                return res.status(200).json([])
            }    
        }else{
            checkMessages(conversationId)
            console.log("here");
        }
    } catch (error) {
        console.log(error, 'Error');
    }
})

app.get('/api/users/:userId',async(req,res,next)=>{
    try {
        const userId = req.params.userId;
        const users = await Users.find({_id:{$ne: userId}});
        const usersData = Promise.all( users.map(async(user)=>{
            return {
                user:{ userName: user.userName, email: user.email, receiverId: user._id},
                
            }
        }))
        res.status(200).json(await usersData);
    } catch (error) {
        console.log('Error',error)
    }
})

app.listen(port,()=>{
    console.log("listening on port "+ port)
})