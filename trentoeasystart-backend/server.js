

const express = require('express');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const connectDB = require('./config/db.js');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message.js');


const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');


const { CohereClient } = require('cohere-ai');


dotenv.config();


connectDB();


const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, '../swagger_code', 'oas3.yaml'), 'utf8'));


const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const app = express();


app.use(cors());
app.use(express.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const authRoutes = require('./routes/auth.js');
const accommodationsRoutes = require('./routes/accommodations.js');
const contactRoutes = require('./routes/contact.js');
const externalAccommodationsRoutes = require('./routes/externalAccommodations.js');
const newsRoutes = require('./routes/news.js');
const eventsRoutes = require('./routes/events.js');
const servicesRoutes = require('./routes/services.js');


app.use('/api/auth', authRoutes);
app.use('/api/accommodations', accommodationsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/external-accommodations', externalAccommodationsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/services', servicesRoutes);


app.use(express.static(path.join(__dirname, '../trentoeasystart-frontend')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../trentoeasystart-frontend/main.html'));
});


const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5000", // Replace with your actual origin
    methods: ["GET", "POST"]
  }
});



io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication required"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);
    socket.user = decoded.user;
    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});


io.on('connection', async (socket) => {
  console.log('New client connected:', socket.id, 'User:', socket.user);

  const username = socket.user.name;
  if (!username) {
    console.error('Username is undefined');
    socket.disconnect();
    return;
  }

  console.log(`${username} has connected`);

  const previousMessages = await Message.find().sort({ date: 1 }).limit(100);
  previousMessages.forEach(msg => {
    socket.emit('message', { user: msg.user, text: msg.text });
  });

  socket.emit('message', { user: 'admin', text: `Welcome, ${username}!` });

  socket.broadcast.emit('message', { user: 'admin', text: `${username} has joined the chat.` });

  socket.on('chatMessage', async (message) => {
    const newMessage = new Message({
      user: username,
      text: message
    });
    await newMessage.save();

    io.emit('message', { user: username, text: message });
    if (message.startsWith('@bot')) {
      const prompt = message.replace('@bot', '').trim();

      try {
        const response = await cohere.chat({
          model: 'command',
          message: prompt,
        });

        const botResponse = response.text.trim();

        const botMessage = new Message({
          user: 'bot',
          text: botResponse
        });
        await botMessage.save();

        io.emit('message', { user: 'bot', text: botResponse });
      } catch (error) {
        console.error('Error with Cohere API:', error);
        io.emit('message', { user: 'bot', text: 'Sorry, an error occurred while processing your request.' });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    socket.broadcast.emit('message', { user: 'admin', text: `${username} has left the chat.` });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
