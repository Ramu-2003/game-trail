import { FaTrophy, FaSkull, FaClock, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const WinnerModal = ({ data, currentUser, onClose }) => {
    const navigate = useNavigate();
    const isWinner = data.winner === currentUser;

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="modal-overlay">
            <div className={`winner-modal ${isWinner ? 'modal-victory' : 'modal-defeat'}`}>
                <div className="modal-particles">
                    {isWinner && [...Array(20)].map((_, i) => (
                        <span key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${1 + Math.random() * 2}s`
                        }}></span>
                    ))}
                </div>

                <div className="modal-icon">
                    {isWinner ? <FaTrophy /> : data.reason === 'time-up' ? <FaClock /> : <FaSkull />}
                </div>

                <h1 className="modal-title">
                    {data.reason === 'time-up' ? "TIME'S UP!" : isWinner ? 'VICTORY!' : 'DEFEAT!'}
                </h1>

                <p className="modal-message">{data.message}</p>

                {data.timeTaken > 0 && (
                    <div className="modal-stats">
                        <div className="stat">
                            <FaClock />
                            <span>Time: {Math.floor(data.timeTaken / 60)}m {data.timeTaken % 60}s</span>
                        </div>
                    </div>
                )}

                <div className="modal-actions">
                    <button onClick={handleGoHome} className="btn-primary">
                        <FaHome /> Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WinnerModal;
