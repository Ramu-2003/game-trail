import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGamepad, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <FaGamepad className="brand-icon" />
                <span>GAME-ROOM</span>
            </Link>
            <div className="navbar-right">
                {user && (
                    <>
                        <span className="navbar-user">
                            <span className="user-dot"></span>
                            {user.username}
                        </span>
                        <button onClick={handleLogout} className="btn-logout">
                            <FaSignOutAlt /> Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
