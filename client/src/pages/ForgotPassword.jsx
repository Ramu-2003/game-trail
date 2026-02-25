import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaGamepad, FaPaperPlane } from 'react-icons/fa';
import API from '../api/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await API.post('/auth/forgot-password', { email });
            setSuccess(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-effects">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
            </div>
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <FaGamepad className="auth-icon" />
                        <h1>GAME-ROOM</h1>
                        <p>Reset Your Password</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                placeholder="Your Email Address"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary btn-full" disabled={loading}>
                            {loading ? <span className="spinner"></span> : <><FaPaperPlane /> Send Reset Link</>}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Remember your password? <Link to="/login">Login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
