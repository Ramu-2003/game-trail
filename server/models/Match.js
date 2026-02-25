const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true
    },
    winner: {
        type: String,
        required: true
    },
    loser: {
        type: String,
        required: true
    },
    timeTaken: {
        type: Number,
        default: 0
    },
    finishedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
