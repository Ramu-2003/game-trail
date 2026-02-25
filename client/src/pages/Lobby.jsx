import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaCrown, FaCheck, FaPlay, FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import socket from '../socket/socket';
import Navbar from '../components/Navbar';

const Lobby = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [allReady, setAllReady] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const joinedRef = useRef(false);

    // Fetch room data once
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await API.get(`/room/${roomId}`);
                setRoom(res.data);
                setIsHost(res.data.host === user.id);
            } catch (err) {
                setError('Room not found');
            }
        };
        fetchRoom();
    }, [roomId, user]);

    // Socket setup — runs ONCE when room is loaded, NOT on room changes
    useEffect(() => {
        if (!user || !room || joinedRef.current) return;
        joinedRef.current = true;

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit('join-room', { roomId, username: user.username });

        socket.on('room-update', (data) => {
            setPlayers(data.players || []);
            setAllReady(data.players?.every(p => p.ready) || false);
            if (data.opponentUsername) {
                setRoom(prev => prev ? ({ ...prev, opponentUsername: data.opponentUsername }) : prev);
            }
        });

        socket.on('game-started', () => {
            navigate(`/game/${roomId}`);
        });

        socket.on('player-disconnected', ({ message }) => {
            setError(message);
        });

        return () => {
            socket.off('room-update');
            socket.off('game-started');
            socket.off('player-disconnected');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room !== null]);

    const handleReady = () => {
        socket.emit('player-ready', { roomId, username: user.username });
    };

    const handleStart = () => {
        socket.emit('start-game', { roomId });
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (error) {
        return (
            <div className="room-page">
                <Navbar />
                <div className="room-container">
                    <div className="alert alert-error">{error}</div>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="room-page">
                <Navbar />
                <div className="room-container">
                    <div className="loading-screen"><div className="loader"></div><p>Loading room...</p></div>
                </div>
            </div>
        );
    }

    return (
        <div className="lobby-page">
            <Navbar />
            <div className="auth-bg-effects">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
            </div>

            <div className="lobby-container">
                <div className="lobby-header">
                    <h1>⚔️ Battle Lobby</h1>
                    <div className="lobby-room-info">
                        <span className="lobby-roomid">Room: {roomId}</span>
                        <button onClick={copyRoomId} className="btn-copy-sm">
                            {copied ? <FaCheck /> : <FaCopy />}
                        </button>
                    </div>
                </div>

                <div className="lobby-room-details">
                    <div className="lobby-detail">
                        <span className="detail-label">Password:</span>
                        <span className="detail-value">
                            {showPassword ? room.password : '••••••••'}
                            <button onClick={() => setShowPassword(!showPassword)} className="btn-copy-sm">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </span>
                    </div>
                    <div className="lobby-detail">
                        <span className="detail-label">Challenge:</span>
                        <span className="detail-value">{room.challenge}</span>
                    </div>
                    <div className="lobby-detail">
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{room.timeLimit} min</span>
                    </div>
                </div>

                <div className="lobby-players">
                    {/* Player A - Host */}
                    <div className="player-card player-blue">
                        <div className="player-crown"><FaCrown /></div>
                        <div className="player-avatar">
                            <FaUser />
                        </div>
                        <h3>{room.hostUsername}</h3>
                        <span className="player-role">HOST</span>
                        <div className="player-status ready">
                            <FaCheck /> Ready
                        </div>
                    </div>

                    <div className="vs-badge">
                        <span>VS</span>
                    </div>

                    {/* Player B - Opponent */}
                    <div className={`player-card player-red ${!room.opponentUsername ? 'player-waiting' : ''}`}>
                        <div className="player-avatar">
                            <FaUser />
                        </div>
                        {room.opponentUsername ? (
                            <>
                                <h3>{room.opponentUsername}</h3>
                                <span className="player-role">CHALLENGER</span>
                                {players.find(p => p.username === room.opponentUsername)?.ready ? (
                                    <div className="player-status ready"><FaCheck /> Ready</div>
                                ) : (
                                    <div className="player-status not-ready">Not Ready</div>
                                )}
                            </>
                        ) : (
                            <>
                                <h3>Waiting...</h3>
                                <span className="player-role">?????</span>
                                <div className="player-status waiting">
                                    <div className="dots-loader">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="lobby-actions">
                    {!isHost && !players.find(p => p.username === user.username)?.ready && (
                        <button onClick={handleReady} className="btn-primary btn-ready">
                            <FaCheck /> I'm Ready!
                        </button>
                    )}

                    {isHost && allReady && players.length >= 2 && (
                        <button onClick={handleStart} className="btn-primary btn-start btn-glow">
                            <FaPlay /> Start Battle!
                        </button>
                    )}

                    {isHost && (!allReady || players.length < 2) && (
                        <p className="lobby-waiting-text">
                            {players.length < 2 ? '⏳ Waiting for opponent to join...' : '⏳ Waiting for opponent to be ready...'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Lobby;
