import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCopy, FaEye, FaEyeSlash, FaGamepad, FaClock, FaCheck, FaArrowLeft } from 'react-icons/fa';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const CreateRoom = () => {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [challenge, setChallenge] = useState('Write HELLO WORLD inside H1 tag');
    const [expectedOutput, setExpectedOutput] = useState('<h1>HELLO WORLD</h1>');
    const [timeLimit, setTimeLimit] = useState(5);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState({ id: false, pass: false });

    const handleCreate = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await API.post('/room/create', { challenge, expectedOutput, timeLimit });
            setRoom(res.data.room);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [field]: true });
        setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
    };

    const handleEnterRoom = () => {
        if (room) {
            navigate(`/lobby/${room.roomId}`);
        }
    };

    return (
        <div className="room-page">
            <Navbar />
            <div className="auth-bg-effects">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
            </div>

            <div className="room-container">
                <button onClick={() => navigate('/')} className="btn-back">
                    <FaArrowLeft /> Back
                </button>

                <div className="room-card">
                    <div className="auth-header">
                        <FaGamepad className="auth-icon" />
                        <h1>Create Battle Room</h1>
                        <p>Set up your coding arena</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    {!room ? (
                        <div className="create-form">
                            <div className="form-group">
                                <label>⚔️ Challenge</label>
                                <textarea
                                    value={challenge}
                                    onChange={(e) => setChallenge(e.target.value)}
                                    rows={3}
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-group">
                                <label>✅ Expected Output</label>
                                <textarea
                                    value={expectedOutput}
                                    onChange={(e) => setExpectedOutput(e.target.value)}
                                    rows={2}
                                    className="form-textarea"
                                    placeholder="e.g. <h1>HELLO WORLD</h1>"
                                />
                            </div>

                            <div className="form-group">
                                <label><FaClock /> Time Limit (minutes)</label>
                                <div className="time-selector">
                                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => (
                                        <button
                                            key={t}
                                            className={`time-btn ${timeLimit === t ? 'active' : ''}`}
                                            onClick={() => setTimeLimit(t)}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>👥 Players</label>
                                <div className="player-mode">2 Players (1 vs 1)</div>
                            </div>

                            <button onClick={handleCreate} className="btn-primary btn-full" disabled={loading}>
                                {loading ? <span className="spinner"></span> : <><FaCheck /> Create Room</>}
                            </button>
                        </div>
                    ) : (
                        <div className="room-created">
                            <div className="room-info-card">
                                <div className="room-info-row">
                                    <label>Room ID</label>
                                    <div className="room-info-value">
                                        <span className="room-id-display">{room.roomId}</span>
                                        <button onClick={() => copyToClipboard(room.roomId, 'id')} className="btn-copy">
                                            {copied.id ? <FaCheck /> : <FaCopy />}
                                        </button>
                                    </div>
                                </div>

                                <div className="room-info-row">
                                    <label>Password</label>
                                    <div className="room-info-value">
                                        <span className="room-pass-display">
                                            {showPassword ? room.password : '••••••••'}
                                        </span>
                                        <button onClick={() => setShowPassword(!showPassword)} className="btn-copy">
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        <button onClick={() => copyToClipboard(room.password, 'pass')} className="btn-copy">
                                            {copied.pass ? <FaCheck /> : <FaCopy />}
                                        </button>
                                    </div>
                                </div>

                                <div className="room-info-row">
                                    <label>Challenge</label>
                                    <div className="room-info-value">
                                        <span>{room.challenge}</span>
                                    </div>
                                </div>

                                <div className="room-info-row">
                                    <label>Time Limit</label>
                                    <div className="room-info-value">
                                        <span>{room.timeLimit} minutes</span>
                                    </div>
                                </div>
                            </div>

                            <p className="room-share-info">
                                📤 Share the Room ID & Password with your opponent!
                            </p>

                            <button onClick={handleEnterRoom} className="btn-primary btn-full btn-glow">
                                Enter Room Lobby →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
