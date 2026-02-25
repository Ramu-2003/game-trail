const express = require('express');
const crypto = require('crypto');
const Room = require('../models/Room');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Generate unique room ID (6 chars)
const generateRoomId = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Generate room password (8 chars)
const generateRoomPassword = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// ─── CREATE ROOM ────────────────────────────────────────────
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { challenge, expectedOutput, timeLimit } = req.body;

        const roomId = generateRoomId();
        const password = generateRoomPassword();

        const room = new Room({
            roomId,
            password,
            host: req.user.id,
            hostUsername: req.user.username,
            challenge: challenge || 'Write HELLO WORLD inside H1 tag',
            expectedOutput: expectedOutput || '<h1>HELLO WORLD</h1>',
            timeLimit: timeLimit || 5,
            state: 'waiting'
        });

        await room.save();

        res.status(201).json({
            message: 'Room created successfully!',
            room: {
                roomId: room.roomId,
                password: room.password,
                challenge: room.challenge,
                expectedOutput: room.expectedOutput,
                timeLimit: room.timeLimit,
                state: room.state,
                hostUsername: room.hostUsername
            }
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── JOIN ROOM ──────────────────────────────────────────────
router.post('/join', authMiddleware, async (req, res) => {
    try {
        const { roomId, password } = req.body;

        if (!roomId || !password) {
            return res.status(400).json({ message: 'Room ID and Password are required' });
        }

        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.password !== password) {
            return res.status(400).json({ message: 'Incorrect room password' });
        }

        if (room.host === req.user.id) {
            return res.status(400).json({ message: 'You cannot join your own room' });
        }

        if (room.state !== 'waiting') {
            return res.status(400).json({ message: 'Room is no longer accepting players' });
        }

        if (room.opponent) {
            return res.status(400).json({ message: 'Room is already full' });
        }

        room.opponent = req.user.id;
        room.opponentUsername = req.user.username;
        await room.save();

        res.json({
            message: 'Joined room successfully!',
            room: {
                roomId: room.roomId,
                challenge: room.challenge,
                expectedOutput: room.expectedOutput,
                timeLimit: room.timeLimit,
                state: room.state,
                hostUsername: room.hostUsername,
                opponentUsername: room.opponentUsername
            }
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET ROOM INFO ──────────────────────────────────────────
router.get('/:roomId', authMiddleware, async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json({
            roomId: room.roomId,
            password: room.password,
            challenge: room.challenge,
            expectedOutput: room.expectedOutput,
            timeLimit: room.timeLimit,
            state: room.state,
            hostUsername: room.hostUsername,
            opponentUsername: room.opponentUsername,
            host: room.host
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
