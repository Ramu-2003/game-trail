import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaKey, FaHashtag, FaSignInAlt, FaGamepad, FaArrowLeft } from 'react-icons/fa';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const JoinRoom = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await API.post('/room/join', { roomId: roomId.toUpperCase(), password: password.toUpperCase() });
            navigate(`/lobby/${roomId.toUpperCase()}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join room');
        } finally {
            setLoading(false);
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
                        <h1>Join Battle Room</h1>
                        <p>Enter the arena</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleJoin} className="auth-form">
                        <div className="input-group">
                            <FaHashtag className="input-icon" />
                            <input
                                type="text"
                                placeholder="Room ID"
                                value={roomId}
                                onChange={(e) => { setRoomId(e.target.value); setError(''); }}
                                required
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>

                        <div className="input-group">
                            <FaKey className="input-icon" />
                            <input
                                type="text"
                                placeholder="Room Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                required
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>

                        <button type="submit" className="btn-primary btn-full" disabled={loading}>
                            {loading ? <span className="spinner"></span> : <><FaSignInAlt /> Join Room</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JoinRoom;
