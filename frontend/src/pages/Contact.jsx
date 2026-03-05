import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Contact = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await API.post('/api/contact', formData);
            setStatus({ type: 'success', message: t('contact.success') });
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            setStatus({ type: 'error', message: t('contact.error') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">
            <header className="page-header animate-fade-in">
                <h1>{t('contact.header')}</h1>
                <p>{t('contact.subtitle')}</p>
            </header>

            <div className="contact-grid">
                <div className="contact-info">
                    <div className="info-card glass-effect animate-slide-up">
                        <Mail className="icon" />
                        <h3>{t('contact.email_title')}</h3>
                        <p>devan020480@gmail.com</p>
                    </div>
                    <div className="info-card glass-effect animate-slide-up delay-1">
                        <Phone className="icon" />
                        <h3>{t('contact.call_title')}</h3>
                        <p>+91 97421 85165</p>
                    </div>
                    <div className="info-card glass-effect animate-slide-up delay-2">
                        <MapPin className="icon" />
                        <h3>{t('contact.visit_title')}</h3>
                        <p>{t('contact.visit_address')}</p>
                    </div>
                </div>

                <form className="contact-form glass-effect animate-slide-up" onSubmit={handleSubmit}>
                    {status.message && (
                        <div className={`status-msg ${status.type}`}>
                            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <span>{status.message}</span>
                        </div>
                    )}
                    <div className="form-group">
                        <label>{t('contact.form_name')}</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('contact.form_placeholder_name')}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('contact.form_email')}</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('contact.form_placeholder_email')}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('contact.form_msg')}</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="5"
                            placeholder={t('contact.form_placeholder_msg')}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-secondary" disabled={loading}>
                        {loading ? '...' : t('contact.form_submit')} <Send size={18} />
                    </button>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .contact-page { padding: 4rem 5%; max-width: 1200px; margin: 0 auto; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 3rem; margin-top: 3rem; }
        .contact-info { display: flex; flex-direction: column; gap: 1.5rem; }
        .info-card { padding: 2rem; border-radius: 20px; text-align: center; }
        .info-card .icon { color: var(--accent); margin-bottom: 1rem; }
        
        .contact-form { padding: 3rem; border-radius: 30px; display: flex; flex-direction: column; gap: 1.5rem; }
        .status-msg { 
            padding: 1rem; 
            border-radius: 12px; 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            font-weight: 600;
            font-size: 0.9rem;
        }
        .status-msg.success { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
        .status-msg.error { background: #fff2f0; color: #ff4d4f; border: 1px solid #ffbb96; }

        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #eee;
          background: #f9f9f9;
        }
        
        @media (max-width: 868px) {
          .contact-grid { grid-template-columns: 1fr; }
        }
      `}} />
        </div>
    );
};

export default Contact;
