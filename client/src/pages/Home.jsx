import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSignInAlt, FaGamepad, FaBolt, FaCode, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="home-page">
            <Navbar />

            <div className="home-bg-effects">
                <div className="bg-grid"></div>
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
                <div className="bg-orb bg-orb-3"></div>
            </div>

            <div className="home-content">
                <div className="home-hero">
                    <div className="hero-badge">
                        <FaBolt /> COMPETITIVE CODING ARENA
                    </div>
                    <h1 className="hero-title">
                        <span className="title-game">GAME</span>
                        <span className="title-dash">-</span>
                        <span className="title-room">ROOM</span>
                    </h1>
                    <p className="hero-subtitle">
                        Challenge your friends. Write code. Win the battle.
                    </p>
                </div>

                <div className="home-features">
                    <div className="feature-card">
                        <FaCode className="feature-icon" />
                        <h3>Code Battle</h3>
                        <p>Solve coding challenges in real-time</p>
                    </div>
                    <div className="feature-card">
                        <FaBolt className="feature-icon" />
                        <h3>Real-Time</h3>
                        <p>Live timer, code sync & instant results</p>
                    </div>
                    <div className="feature-card">
                        <FaTrophy className="feature-icon" />
                        <h3>Win & Grow</h3>
                        <p>Sharpen skills with every battle</p>
                    </div>
                </div>

                <div className="home-actions">
                    <button onClick={() => navigate('/create-room')} className="btn-action btn-create">
                        <div className="btn-action-icon">
                            <FaPlus />
                        </div>
                        <div className="btn-action-text">
                            <span className="btn-action-title">Create Room</span>
                            <span className="btn-action-desc">Start a new battle</span>
                        </div>
                    </button>

                    <div className="vs-divider">
                        <span>VS</span>
                    </div>

                    <button onClick={() => navigate('/join-room')} className="btn-action btn-join">
                        <div className="btn-action-icon">
                            <FaSignInAlt />
                        </div>
                        <div className="btn-action-text">
                            <span className="btn-action-title">Join Room</span>
                            <span className="btn-action-desc">Enter a battle</span>
                        </div>
                    </button>
                </div>

                <div className="home-welcome">
                    Welcome, <span className="welcome-user">{user?.username}</span>! Ready to battle?
                </div>
            </div>
        </div>
    );
};

export default Home;
