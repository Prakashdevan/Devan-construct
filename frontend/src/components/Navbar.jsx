import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { HardHat, Menu, X, Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const langRef = useRef(null);
  const { lang: currentLang, setLang, t } = useLanguage();
  const location = useLocation();

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'ಹಿन्दी' }
  ];

  // Only handle initial active state and external page navigation
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveTab('');
    } else if (location.hash === '#about') {
      setActiveTab('about');
    } else if (location.hash === '') {
      setActiveTab('home');
    }
  }, [location.pathname]); // Removed hash dependency to prevent auto-highlight on scroll-driven hash updates if they exist

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLang(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangChange = (code) => {
    localStorage.setItem('lang', code);
    setLang(code);
    setShowLang(false);
  };

  const getActiveLangLabel = () => {
    const langObj = languages.find(l => l.code === currentLang);
    return langObj ? langObj.native : 'English';
  };

  const scrollToTop = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
      setActiveTab('home');
    }
  };

  const isHomeActive = location.pathname === '/' && activeTab === 'home';
  const isAboutActive = location.pathname === '/' && activeTab === 'about';

  return (
    <nav className="navbar glass-effect fixed-nav">
      <div className="nav-content">
        <Link to="/" className="logo" onClick={(e) => scrollToTop(e)}>
          <img src="/favicon.png" alt="DEVAN" className="logo-img" />
          <div className="logo-text">
            <span>DEVAN</span>
            <small>CONSTRUCTION</small>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-links">
          {/* Use standard Link to prevent NavLink's automatic active matching */}
          <Link
            to="/"
            onClick={(e) => scrollToTop(e)}
            className={isHomeActive ? 'active' : ''}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/#about"
            className={isAboutActive ? 'active' : ''}
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', '#about');
                setActiveTab('about');
              }
            }}
          >
            {t('nav.about')}
          </Link>
          <NavLink to="/centering-materials">{t('nav.materials')}</NavLink>
          <NavLink to="/gallery">{t('nav.gallery')}</NavLink>
          <NavLink to="/contact">{t('nav.contact')}</NavLink>

          <div className="lang-dropdown-container" ref={langRef}>
            <button className="lang-btn" onClick={() => setShowLang(!showLang)}>
              <Languages size={18} />
              <span>{getActiveLangLabel()}</span>
              <ChevronDown size={14} className={showLang ? 'rotate' : ''} />
            </button>

            {showLang && (
              <div className="lang-menu glass-effect">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={currentLang === lang.code ? 'active' : ''}
                    onClick={() => handleLangChange(lang.code)}
                  >
                    <span className="native">{lang.native}</span>
                    <span className="label">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/login" className="btn btn-primary login-btn">
            {t('nav.admin')}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu glass-effect">
          <Link
            to="/"
            className={isHomeActive ? 'active' : ''}
            onClick={(e) => {
              setIsOpen(false);
              scrollToTop(e);
            }}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/#about"
            className={isAboutActive ? 'active' : ''}
            onClick={(e) => {
              setIsOpen(false);
              if (window.location.pathname === '/') {
                e.preventDefault();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', '#about');
                setActiveTab('about');
              }
            }}
          >
            {t('nav.about')}
          </Link>
          <NavLink to="/centering-materials" onClick={() => setIsOpen(false)}>{t('nav.materials')}</NavLink>
          <NavLink to="/gallery" onClick={() => setIsOpen(false)}>{t('nav.gallery')}</NavLink>
          <NavLink to="/contact" onClick={() => setIsOpen(false)}>{t('nav.contact')}</NavLink>
          <NavLink to="/login" onClick={() => setIsOpen(false)} className="mobile-login-btn">{t('nav.admin')}</NavLink>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          display: flex;
          align-items: center;
          z-index: 1000;
          padding: 0 5%;
        }
        .nav-content {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--primary);
        }
        .logo-img { width: 34px; height: 34px; object-fit: contain; border-radius: 4px; }
        .logo-text { display: flex; flex-direction: column; line-height: 1; }
        .logo-text span { font-weight: 800; font-size: 1.5rem; letter-spacing: -1px; }
        .logo-text small { font-size: 0.7rem; letter-spacing: 1px; color: var(--text-light); }
        
        .nav-links { display: flex; align-items: center; gap: 30px; }
        .nav-links a { 
          text-decoration: none; 
          color: var(--text-main); 
          font-weight: 500; 
          font-size: 0.95rem;
          transition: color 0.3s;
        }
        .nav-links a.active { color: var(--accent) !important; font-weight: 600; }
        .nav-links a:hover { color: var(--accent); }
        
        .lang-dropdown-container { position: relative; }
        .lang-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 180, 0, 0.1);
          border: 1px solid rgba(255, 180, 0, 0.2);
          color: var(--primary);
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.3s;
        }
        .lang-btn:hover { background: rgba(255, 180, 0, 0.2); }
        .lang-btn .rotate { transform: rotate(180deg); }
        .lang-btn svg { transition: transform 0.3s; }

        .lang-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 180px;
          padding: 10px;
          border-radius: 15px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,180,0,0.2);
          z-index: 1001;
        }
        .lang-menu button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          border: none;
          background: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lang-menu button:hover { background: rgba(255,180,0,0.1); color: var(--accent-hover); }
        .lang-menu button.active { background: var(--accent); color: var(--primary); }
        .lang-menu .native { font-weight: 700; font-size: 0.95rem; }
        .lang-menu .label { font-size: 0.75rem; opacity: 0.7; }

        .mobile-toggle { display: none; background: none; border: none; cursor: pointer; color: var(--primary); }

        .mobile-menu {
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          text-align: center;
          animation: slideInDown 0.3s ease-out;
        }
        .mobile-menu a { text-decoration: none; color: var(--primary); font-size: 1.2rem; font-weight: 600; }
        .mobile-menu a.active { color: var(--accent) !important; }

        @keyframes slideInDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 992px) {
          .nav-links { display: none; }
          .mobile-toggle { display: block; }
        }
      `}} />
    </nav>
  );
};

export default Navbar;
