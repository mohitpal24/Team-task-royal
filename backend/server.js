const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.set('io', io);

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('Unauthorized'));
    }
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('joinProject', (projectId) => {
    if (projectId) {
      socket.join(projectId);
    }
  });

  socket.on('leaveProject', (projectId) => {
    if (projectId) {
      socket.leave(projectId);
    }
  });

  socket.on('disconnect', () => {
    // connection closed
  });
});

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({ origin: true, credentials: true }));

// Route files
const auth = require('./src/routes/authRoutes');
const projects = require('./src/routes/projectRoutes');
const tasks = require('./src/routes/taskRoutes');
const users = require('./src/routes/userRoutes');
const notifications = require('./src/routes/notificationRoutes');
const activity = require('./src/routes/activityRoutes');

// Static upload path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/projects', projects);
app.use('/api/tasks', tasks);
app.use('/api/users', users);
app.use('/api/notifications', notifications);
app.use('/api/activity', activity);

// Error handler middleware (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.use((req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../', 'frontend', 'dist', 'index.html')
    )
  );
} else {
  app.get('/', (req, res) => res.send('API is running'));
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
