const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const socketIo = require('socket.io');

// Use server instance for Socket.IO
const io = socketIo(server, {
    cors: {
        origin: 'https://react-js-chat-app-hy22.vercel.app/',
        default: 'https://react-js-chat-app-hy22.vercel.app/',
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    }
});
app.use(
    cors({
        origin: 'https://react-js-chat-app-alpha.vercel.app', // Replace with your frontend URL
        default: 'https://react-js-chat-app-alpha.vercel.app', 
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"]
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Socket.IO setup
let users = [];
io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on('addUser', (userId) => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await Users.findById(senderId);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                receiverId,
                message,
                conversationId,
                user: { id: user._id, userName: user.userName, email: user.email }
            });
        }
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
});

io.engine.on("connection_error", (err) => {
    console.error('connection_error', err);
});

// DB connection
require('./db/connection.js');

// Imports
const Users = require('./models/Users.js');
const Conversation = require('./models/Conversations.js');
const Messages = require('./models/Messages.js');

const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.send('Welcome');
});

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { userName, email, password, confirmPassword } = req.body;
        console.log("registered");
        if (!userName || !email || !password) {
            return res.status(400).send("Please enter all details");
        }
        const alreadyExists = await Users.findOne({ email });
        if (alreadyExists) {
            return res.status(400).send('User already exists');
        }
        const newUser = new Users({ userName, email });
        bcryptjs.hash(password, 10, async (err, hashedPassword) => {
            newUser.set('password', hashedPassword);
            await newUser.save();
            res.status(200).json({ message: 'User registered successfully' });
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("logged in");
        if (!email || !password) {
            return res.status(400).send("Please fill all the details");
        }
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found');
        }
        const validateUser = await bcryptjs.compare(password, user.password);
        if (!validateUser) {
            return res.status(400).send('Email or password is incorrect');
        }
        const payload = { userId: user._id, email: user.email };
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "THIS_IS_A_JWT_SECRET_KEY";
        jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 86400 }, async (err, token) => {
            if (err) {
                return res.status(500).send('Error generating token');
            }
            await Users.updateOne({ _id: user._id }, { $set: { token } });
            res.status(200).json({ user: { id: user._id, userName: user.userName, email: user.email }, token });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Create new conversation between sender and receiver
app.post("/api/conversation", async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const newConversation = new Conversation({ members: [senderId, receiverId] });
        await newConversation.save();
        res.status(200).send("Conversation created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Get all conversations of that user with this userId
app.get("/api/conversation/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversation = await Conversation.find({ members: { $in: [userId] } });
        const conversationUserData = await Promise.all(conversation.map(async (conv) => {
            const receiverId = conv.members.find(member => member !== userId);
            const user = await Users.findById(receiverId);
            return {
                user: { receiverId: user._id, userName: user.userName, email: user.email },
                conversationId: conv._id
            };
        }));
        res.status(200).json(conversationUserData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Create and send message
app.post("/api/message", async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId = '' } = req.body;
        if (!senderId || !message) {
            return res.status(400).send('Please enter all details');
        }
        if (conversationId === "new" && receiverId) {
            const newConversation = new Conversation({ members: [senderId, receiverId] });
            await newConversation.save();
            const newMessage = new Messages({ conversationId: newConversation._id, senderId, message });
            await newMessage.save();
            return res.status(200).send('Created new conversation and message sent successfully');
        } else if (!conversationId && !receiverId) {
            return res.status(400).send('Please enter all details');
        }
        const newMessage = new Messages({ conversationId, senderId, message });
        await newMessage.save();
        res.status(200).send("Message sent successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Fetch all messages of a conversation
app.get('/api/message/:conversationId', async (req, res) => {
    try {
        const checkMessages = async (conversationId) => {
            const messages = await Messages.find({ conversationId });
            const messageUserData = await Promise.all(messages.map(async (msg) => {
                const user = await Users.findById(msg.senderId);
                return {
                    user: { id: user._id, userName: user.userName, email: user.email },
                    message: msg.message
                };
            }));
            res.status(200).json(messageUserData);
        };
        const conversationId = req.params.conversationId;
        if (conversationId === "new") {
            const checkConversationId = await Conversation.find({ members: { $all: [req.query.senderId, req.query.receiverId] } });
            if (checkConversationId.length > 0) {
                checkMessages(checkConversationId[0]._id);
            } else {
                res.status(200).json([]);
            }
        } else {
            checkMessages(conversationId);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Get all users except the one with the given userId
app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const users = await Users.find({ _id: { $ne: userId } });
        const usersData = await Promise.all(users.map(user => ({
            user: { userName: user.userName, email: user.email, receiverId: user._id }
        })));
        res.status(200).json(usersData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
