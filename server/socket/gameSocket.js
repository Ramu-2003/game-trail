const Room = require('../models/Room');
const Match = require('../models/Match');

// Store active game states in memory
const activeGames = new Map();

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`⚡ User connected: ${socket.id}`);

        // ─── JOIN ROOM ────────────────────────────────────────
        socket.on('join-room', async ({ roomId, username }) => {
            try {
                socket.join(roomId);
                socket.roomId = roomId;
                socket.username = username;

                const room = await Room.findOne({ roomId });
                if (!room) return;

                // Initialize game state if not exists
                if (!activeGames.has(roomId)) {
                    activeGames.set(roomId, {
                        players: {},
                        timer: null,
                        timeRemaining: room.timeLimit * 60,
                        started: false,
                        finished: false
                    });
                }

                const gameState = activeGames.get(roomId);
                gameState.players[username] = {
                    socketId: socket.id,
                    code: '',
                    ready: username === room.hostUsername, // Host is auto-ready
                    connected: true
                };

                io.to(roomId).emit('room-update', {
                    hostUsername: room.hostUsername,
                    opponentUsername: room.opponentUsername,
                    state: room.state,
                    players: Object.keys(gameState.players).map(name => ({
                        username: name,
                        ready: gameState.players[name].ready
                    }))
                });

                console.log(`🎮 ${username} joined room ${roomId}`);
            } catch (error) {
                console.error('Join room socket error:', error);
            }
        });

        // ─── PLAYER READY ─────────────────────────────────────
        socket.on('player-ready', async ({ roomId, username }) => {
            try {
                const gameState = activeGames.get(roomId);
                if (!gameState || !gameState.players[username]) return;

                gameState.players[username].ready = true;

                const room = await Room.findOne({ roomId });
                if (room) {
                    room.state = 'ready';
                    await room.save();
                }

                io.to(roomId).emit('room-update', {
                    hostUsername: room.hostUsername,
                    opponentUsername: room.opponentUsername,
                    state: 'ready',
                    players: Object.keys(gameState.players).map(name => ({
                        username: name,
                        ready: gameState.players[name].ready
                    }))
                });
            } catch (error) {
                console.error('Player ready error:', error);
            }
        });

        // ─── START GAME ───────────────────────────────────────
        socket.on('start-game', async ({ roomId }) => {
            try {
                const gameState = activeGames.get(roomId);
                if (!gameState) return;

                // Check all players ready
                const allReady = Object.values(gameState.players).every(p => p.ready);
                if (!allReady) return;

                const room = await Room.findOne({ roomId });
                if (!room) return;

                room.state = 'playing';
                await room.save();

                gameState.started = true;
                gameState.timeRemaining = room.timeLimit * 60;

                io.to(roomId).emit('game-started', {
                    challenge: room.challenge,
                    expectedOutput: room.expectedOutput,
                    timeLimit: room.timeLimit
                });

                // Start timer
                gameState.timer = setInterval(async () => {
                    gameState.timeRemaining--;

                    io.to(roomId).emit('timer-update', {
                        timeRemaining: gameState.timeRemaining
                    });

                    if (gameState.timeRemaining <= 0) {
                        clearInterval(gameState.timer);
                        gameState.finished = true;

                        room.state = 'finished';
                        await room.save();

                        io.to(roomId).emit('game-over', {
                            reason: 'time-up',
                            message: 'Time is up! No winner this round.'
                        });

                        activeGames.delete(roomId);
                    }
                }, 1000);

            } catch (error) {
                console.error('Start game error:', error);
            }
        });

        // ─── CODE UPDATE ──────────────────────────────────────
        socket.on('code-update', ({ roomId, username, code }) => {
            const gameState = activeGames.get(roomId);
            if (!gameState || !gameState.players[username]) return;

            gameState.players[username].code = code;

            // Convert code to binary for opponent view
            const binaryCode = code.split('').map(char => {
                return char.charCodeAt(0).toString(2).padStart(8, '0');
            }).join(' ');

            // Send binary to all OTHER players
            socket.to(roomId).emit('opponent-code-update', {
                username,
                binaryCode
            });
        });

        // ─── RUN CODE ─────────────────────────────────────────
        socket.on('run-code', ({ roomId, username, code }) => {
            try {
                // Simple HTML evaluation - extract the output
                const output = code.trim();

                socket.emit('code-output', {
                    output,
                    success: true
                });
            } catch (error) {
                socket.emit('code-output', {
                    output: `Error: ${error.message}`,
                    success: false
                });
            }
        });

        // ─── SUBMIT CODE ──────────────────────────────────────
        socket.on('submit-code', async ({ roomId, username, code }) => {
            try {
                const gameState = activeGames.get(roomId);
                if (!gameState || gameState.finished) return;

                const room = await Room.findOne({ roomId });
                if (!room) return;

                const userOutput = code.trim().replace(/\s+/g, ' ');
                const expected = room.expectedOutput.trim().replace(/\s+/g, ' ');

                if (userOutput.toLowerCase() === expected.toLowerCase()) {
                    // WINNER!
                    gameState.finished = true;
                    if (gameState.timer) clearInterval(gameState.timer);

                    const timeTaken = (room.timeLimit * 60) - gameState.timeRemaining;

                    // Determine loser
                    const allPlayers = Object.keys(gameState.players);
                    const loser = allPlayers.find(p => p !== username) || 'unknown';

                    // Save match result
                    const match = new Match({
                        roomId,
                        winner: username,
                        loser,
                        timeTaken
                    });
                    await match.save();

                    room.state = 'finished';
                    await room.save();

                    io.to(roomId).emit('game-over', {
                        reason: 'winner',
                        winner: username,
                        loser,
                        timeTaken,
                        message: `🏆 ${username} wins!`
                    });

                    activeGames.delete(roomId);
                } else {
                    socket.emit('submit-result', {
                        correct: false,
                        message: 'Output does not match. Keep trying!'
                    });
                }
            } catch (error) {
                console.error('Submit code error:', error);
                socket.emit('submit-result', {
                    correct: false,
                    message: 'Error processing submission'
                });
            }
        });

        // ─── DISCONNECT ───────────────────────────────────────
        socket.on('disconnect', async () => {
            console.log(`💔 User disconnected: ${socket.id}`);

            if (!socket.roomId || !socket.username) return;

            const roomId = socket.roomId;
            const username = socket.username;
            const gameState = activeGames.get(roomId);

            if (!gameState) return;

            if (gameState.started && !gameState.finished) {
                // Game is in progress — other player wins
                gameState.finished = true;
                if (gameState.timer) clearInterval(gameState.timer);

                const allPlayers = Object.keys(gameState.players);
                const winner = allPlayers.find(p => p !== username) || 'unknown';
                const timeTaken = gameState.timeRemaining
                    ? ((activeGames.get(roomId)?.timeRemaining || 0))
                    : 0;

                try {
                    const room = await Room.findOne({ roomId });
                    if (room) {
                        room.state = 'finished';
                        await room.save();

                        const match = new Match({
                            roomId,
                            winner,
                            loser: username,
                            timeTaken: 0
                        });
                        await match.save();
                    }
                } catch (err) {
                    console.error('Disconnect save error:', err);
                }

                io.to(roomId).emit('game-over', {
                    reason: 'disconnect',
                    winner,
                    loser: username,
                    message: `🏆 ${winner} wins! ${username} disconnected.`
                });

                activeGames.delete(roomId);
            } else {
                // Remove player from game state
                if (gameState.players[username]) {
                    delete gameState.players[username];
                }

                io.to(roomId).emit('player-disconnected', {
                    username,
                    message: `${username} has left the room`
                });
            }
        });
    });
};

module.exports = initializeSocket;
