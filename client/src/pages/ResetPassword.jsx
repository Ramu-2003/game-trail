import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaGamepad, FaCheck } from 'react-icons/fa';
import API from '../api/axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await API.post(`/auth/reset-password/${token}`, form);
            setSuccess(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
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
                        <p>Set New Password</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="New Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary btn-full" disabled={loading}>
                            {loading ? <span className="spinner"></span> : <><FaCheck /> Reset Password</>}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p><Link to="/login">Back to Login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
