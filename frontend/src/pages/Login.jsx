import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
    const { t } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await login(email, password);
        if (success) {
            navigate('/admin');
        } else {
            setError(t('login.error'));
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-box glass-effect animate-zoom-in">
                <div className="login-header">
                    <div className="icon-badge">
                        <Lock size={24} />
                    </div>
                    <h1>{t('login.header')}</h1>
                    <p>{t('login.subtitle')}</p>
                    {error && <div className="error-alert">{error}</div>}
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>{t('login.email_label')}</label>
                        <div className="input-wrapper">
                            <User size={20} className="input-icon" />
                            <input
                                type="email"
                                placeholder="admin@construct.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>{t('login.password_label')}</label>
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-secondary login-submit" disabled={loading}>
                        {loading ? t('login.btn_signing') : t('login.btn_signin')} <LogIn size={18} />
                    </button>
                </form>

                <div className="login-footer">
                    <p>{t('login.footer')}</p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .login-container {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .login-box {
          width: 100%;
          max-width: 450px;
          padding: 3rem;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .login-header { text-align: center; margin-bottom: 2.5rem; }
        .icon-badge {
          width: 60px;
          height: 60px;
          background: var(--accent);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: var(--primary);
        }
        .login-header h1 { font-size: 1.8rem; margin-bottom: 0.5rem; font-weight: 800; }
        .login-header p { color: var(--text-light); font-size: 0.95rem; }
        .error-alert {
          background: #fff1f0;
          color: #ff4d4f;
          padding: 10px;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid #ffa39e;
        }

        .login-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .input-group label { display: block; margin-bottom: 0.8rem; font-weight: 600; font-size: 0.9rem; color: var(--text-main); }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 16px; color: #aaa; }
        .input-wrapper input {
          width: 100%;
          padding: 1rem 1rem 1rem 3.2rem;
          border-radius: 12px;
          border: 1px solid #eee;
          background: #f9f9f9;
          font-size: 1rem;
          transition: all 0.3s;
        }
        .input-wrapper input:focus {
          outline: none;
          border-color: var(--accent);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(255,180,0,0.1);
        }
        .toggle-password { position: absolute; right: 16px; background: none; border: none; cursor: pointer; color: #aaa; }
        
        .login-submit { width: 100%; justify-content: center; margin-top: 1rem; padding: 1rem; font-size: 1rem; }
        .login-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .login-footer { text-align: center; margin-top: 2rem; }
        .login-footer p { font-size: 0.8rem; color: #aaa; }
      `}} />
        </div>
    );
};

export default Login;
