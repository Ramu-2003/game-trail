const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    host: {
        type: String,
        required: true
    },
    hostUsername: {
        type: String,
        required: true
    },
    opponent: {
        type: String,
        default: null
    },
    opponentUsername: {
        type: String,
        default: null
    },
    challenge: {
        type: String,
        default: 'Write HELLO WORLD inside H1 tag'
    },
    expectedOutput: {
        type: String,
        default: '<h1>HELLO WORLD</h1>'
    },
    timeLimit: {
        type: Number,
        default: 5,
        min: 2,
        max: 10
    },
    maxPlayers: {
        type: Number,
        default: 2
    },
    state: {
        type: String,
        enum: ['waiting', 'ready', 'playing', 'finished'],
        default: 'waiting'
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
