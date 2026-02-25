const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const initializeSocket = require('./socket/gameSocket');

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:4173'
];

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins in production for now
        }
    },
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/room', roomRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'GAME-ROOM server is running! 🎮' });
});

// Initialize Socket.io
initializeSocket(io);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`\n🎮 GAME-ROOM Server running on port ${PORT}`);
        console.log(`📡 Socket.io ready for connections`);
        console.log(`🔗 http://localhost:${PORT}\n`);
    });
});
