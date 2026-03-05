import React, { useEffect } from 'react';
import { ArrowRight, Drill, Waves, Layers, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
    const { t } = useLanguage();
    useEffect(() => {
        // Scroll to about if hash is present
        if (window.location.hash === '#about') {
            setTimeout(() => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge animate-fade-in">
                        <span className="dot"></span>
                        {t('hero.badge')}
                    </div>
                    <h1 className="animate-slide-up">{t('hero.title1')} <br /><span className="text-accent">{t('hero.title2')}</span></h1>
                    <p className="animate-slide-up delay-1">{t('hero.subtitle')}</p>
                    <div className="hero-btns animate-slide-up delay-2">
                        <Link to="/centering-materials" className="btn btn-primary">{t('hero.cta_primary')}</Link>
                        <Link to="/contact" className="btn btn-secondary">{t('hero.cta_secondary')}</Link>
                    </div>
                </div>
                <div className="hero-image-wrapper animate-zoom-in">
                    <img src="/devan_construction_hero_1772649835336.png" alt="Devan Construction Hero" className="hero-img-premium" />
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="about-section">
                <div className="about-container">
                    <div className="about-image animate-fade-in">
                        <img src="/about_us_construction_team_1772650768616.png" alt="About Devan Construction" className="about-img-premium" />
                        <div className="experience-badge shadow-lg">
                            <span className="years">{t('about.years_exp')}</span>
                            <span className="text">{t('about.years_text')}</span>
                        </div>
                    </div>
                    <div className="about-content animate-slide-up">
                        <div className="section-badge">{t('about.badge')}</div>
                        <h2>{t('about.title1')} <br /><span className="text-accent">{t('about.title2')}</span></h2>
                        <div className="about-text">
                            <p>{t('about.history_p1')}</p>
                            <p>{t('about.history_p2')}</p>
                            <p>{t('about.history_p3')}</p>

                            <div className="highlight-box glass-effect">
                                <p>{t('about.highlight')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-strip animate-fade-in delay-2">
                <div className="stat-item">
                    <h3>{t('stats.exp_years')}</h3>
                    <p>{t('stats.exp_label')}</p>
                </div>
                <div className="stat-item">
                    <h3>{t('stats.projects_val')}</h3>
                    <p>{t('stats.projects_label')}</p>
                </div>
                <div className="stat-item">
                    <h3>{t('stats.workers_val')}</h3>
                    <p>{t('stats.workers_label')}</p>
                </div>
                <div className="stat-item">
                    <h3>{t('stats.safety_val')}</h3>
                    <p>{t('stats.safety_label')}</p>
                </div>
            </section>

            {/* Centering Materials Preview */}
            <section className="materials-preview">
                <div className="section-header animate-slide-up">
                    <div className="section-badge">{t('materials_preview.badge')}</div>
                    <h2>{t('materials_preview.title1')} <span className="text-accent">{t('materials_preview.title2')}</span></h2>
                    <p>{t('materials_preview.subtitle')}</p>
                </div>

                <div className="material-preview-grid">
                    <div className="material-preview-card animate-slide-up delay-1">
                        <div className="card-image">
                            <img src="/steel_sheets_blue.png" alt="Steel Centering Sheets" />
                        </div>
                        <div className="card-content">
                            <h3>{t('materials_preview.steel_title')}</h3>
                            <p>{t('materials_preview.steel_desc')}</p>
                            <Link to="/centering-materials" className="card-link">{t('materials_preview.view_details')} <ArrowRight size={16} /></Link>
                        </div>
                    </div>

                    <div className="material-preview-card animate-slide-up delay-2">
                        <div className="card-image">
                            <img src="/plywood_red.png" alt="Wood Centering" />
                        </div>
                        <div className="card-content">
                            <h3>{t('materials_preview.wood_title')}</h3>
                            <p>{t('materials_preview.wood_desc')}</p>
                            <Link to="/centering-materials" className="card-link">{t('materials_preview.view_details')} <ArrowRight size={16} /></Link>
                        </div>
                    </div>
                </div>

                <div className="view-all-container animate-fade-in delay-3">
                    <Link to="/centering-materials" className="btn btn-primary">
                        {t('materials_preview.view_all')} <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
        .home-page { padding: 0 5%; max-width: 1400px; margin: 0 auto; overflow: hidden; }
        
        .hero { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 5rem; 
          align-items: center; 
          padding: 6rem 0;
          min-height: 85vh;
        }
        
        .hero-badge { 
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 180, 0, 0.1); 
          color: var(--accent-hover); 
          padding: 8px 16px; 
          border-radius: 30px; 
          font-weight: 800; 
          font-size: 0.75rem; 
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 1px solid rgba(255, 180, 0, 0.2);
          margin-bottom: 2rem;
        }
        .hero-badge .dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 10px var(--accent); }

        .hero h1 { font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1.2; margin-bottom: 1.5rem; font-weight: 900; letter-spacing: -2px; }
        .text-accent { color: var(--accent); }
        .hero p { font-size: 1.25rem; color: var(--text-light); margin-bottom: 3rem; max-width: 550px; line-height: 1.6; }
        .hero-btns { display: flex; gap: 1.5rem; }
        
        .btn-outline { 
            padding: 0.8rem 1.8rem;
            border-radius: 12px;
            font-weight: 700;
            border: 2px solid var(--primary);
            color: var(--primary);
            background: transparent;
            transition: all 0.3s;
        }
        .btn-outline:hover, .btn-primary:hover { 
            background: var(--primary); 
            color: white; 
            transform: translateY(-3px);
            transition: 0.3s;
        }
        .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }

        .hero-image-wrapper { position: relative; }
        .hero-img-premium { 
            width: 100%; 
            border-radius: 40px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: all 0.5s;
        }

        /* About Section Styles */
        .about-section { padding: 8rem 0; background: #fff; }
        .about-container { display: grid; grid-template-columns: 1fr 1.2fr; gap: 6rem; align-items: center; }
        
        .about-image { position: relative; }
        .about-img-premium { 
            width: 100%; 
            border-radius: 40px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            object-fit: cover;
            height: 600px;
        }
        
        .experience-badge {
            position: absolute;
            top: 40px;
            right: -20px;
            background: var(--accent);
            padding: 2rem 1.5rem;
            border-radius: 24px;
            text-align: center;
            display: flex;
            flex-direction: column;
            box-shadow: 0 15px 30px rgba(255,180,0,0.3);
            border: none;
        }
        .experience-badge .years { font-size: 2.5rem; font-weight: 900; color: var(--primary); line-height: 1; }
        .experience-badge .text { font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }

        .about-content { padding-right: 2rem; }
        .section-badge { 
            color: var(--accent); 
            font-weight: 800; 
            font-size: 0.8rem; 
            text-transform: uppercase; 
            letter-spacing: 2px;
            margin-bottom: 1rem;
        }
        .about-content h2 { font-size: 3rem; margin-bottom: 2rem; font-weight: 900; letter-spacing: -1.5px; line-height: 1.1; }
        
        .about-text p { 
            color: #555; 
            line-height: 1.8; 
            margin-bottom: 1.5rem; 
            font-size: 1.05rem; 
        }
        .highlight-box {
            background: #fdfaf0;
            padding: 2rem;
            border-radius: 20px;
            border-left: 5px solid var(--accent);
            margin-top: 2rem;
        }
        .highlight-box p { margin-bottom: 0; color: #1a1a1a; font-weight: 600; font-style: italic; }

        @media (max-width: 1024px) {
            .about-container { gap: 3rem; }
            .about-content h2 { font-size: 2.5rem; }
        }

        @media (max-width: 912px) {
            .about-container { grid-template-columns: 1fr; text-align: center; gap: 4rem; }
            .about-image { order: 2; }
            .about-content { order: 1; padding-right: 0; }
            .about-img-premium { height: 400px; }
            .experience-badge { right: 50%; transform: translateX(50%); top: -30px; }
            .highlight-box { text-align: left; }
        }
        

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(5px); }
        }

        .stats-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: #111111;
          color: white;
          padding: 5rem 2rem;
          border-radius: 50px;
          margin: 4rem 0 8rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.2);
        }
        .stats-strip::after {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at top right, rgba(255,180,0,0.05), transparent 70%);
        }
        .stat-item { position: relative; z-index: 1; border-right: 1px solid rgba(255,255,255,0.05); }
        .stat-item:last-child { border-right: none; }
        .stat-item h3 { font-size: 4rem; color: #FFB400; margin-bottom: 0.5rem; font-weight: 900; letter-spacing: -2px; line-height: 1; }
        .stat-item p { color: #888; font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-top: 1rem; }

        @media (max-width: 1024px) {
            .stats-strip { grid-template-columns: repeat(2, 1fr); gap: 3rem; padding: 3rem 2rem; border-radius: 30px; }
            .stat-item { border-right: none; }
            .stat-item h3 { font-size: 3rem; }
        }
        @media (max-width: 600px) {
            .stats-strip { grid-template-columns: 1fr; gap: 4rem; }
            .stat-item h3 { font-size: 3.5rem; }
        }

        .services-preview { padding: 6rem 0; text-align: left; }
        .services-preview h2 { font-size: 3rem; margin-bottom: 4rem; font-weight: 900; letter-spacing: -1.5px; }
        .service-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; }
        .card { 
            padding: 3.5rem 2.5rem; 
            border-radius: 35px; 
            background: white;
            border: 1px solid rgba(0,0,0,0.03);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        }
        .card:hover { transform: translateY(-15px); box-shadow: 0 40px 70px rgba(0,0,0,0.08); border-color: var(--accent); }
        .card-icon { color: var(--accent); margin-bottom: 2rem; background: rgba(255,180,0,0.1); padding: 12px; border-radius: 12px; }
        .card h3 { margin-bottom: 1.2rem; font-size: 1.6rem; font-weight: 800; color: #1a1a1a; }
        .card p { color: #666; font-size: 1.05rem; line-height: 1.6; }

        /* Animations */
        .animate-fade-in { animation: fadeIn 1s ease-out; }
        .animate-slide-up { animation: slideUp 0.8s ease-out backwards; }
        .animate-zoom-in { animation: zoomIn 1.2s ease-out; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        @media (max-width: 1024px) {
            .hero { gap: 2rem; }
            .hero h1 { font-size: 3.5rem; }
        }

        /* Materials Preview Section */
        .materials-preview { padding: 8rem 0; background: #fafafa; }
        .section-header { text-align: center; margin-bottom: 4rem; }
        .section-header h2 { font-size: 3rem; font-weight: 900; margin-bottom: 1rem; letter-spacing: -1.5px; }
        .section-header p { color: #666; font-size: 1.1rem; max-width: 600px; margin: 0 auto; }

        .material-preview-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 3rem; 
            margin-bottom: 4rem;
        }
        
        .material-preview-card { 
            background: #fff; 
            border-radius: 30px; 
            overflow: hidden; 
            box-shadow: 0 15px 35px rgba(0,0,0,0.05);
            border: 1px solid rgba(0,0,0,0.03);
            transition: all 0.3s;
        }
        .material-preview-card:hover { transform: translateY(-10px); box-shadow: 0 25px 50px rgba(0,0,0,0.1); }
        
        .card-image { height: 300px; overflow: hidden; }
        .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .material-preview-card:hover .card-image img { transform: scale(1.1); }
        
        .card-content { padding: 2.5rem; }
        .card-content h3 { font-size: 1.75rem; font-weight: 800; margin-bottom: 1rem; color: #1a1a1a; }
        .card-content p { color: #555; line-height: 1.6; margin-bottom: 1.5rem; font-size: 1.05rem; }
        
        .card-link { 
            display: inline-flex; 
            align-items: center; 
            gap: 8px; 
            color: var(--primary); 
            font-weight: 700; 
            text-decoration: none; 
            font-size: 0.95rem;
            transition: gap 0.3s;
        }
        .card-link:hover { gap: 12px; color: var(--accent-hover); }

        .view-all-container { text-align: center; }

        @media (max-width: 1024px) {
            .hero { grid-template-columns: 1fr; text-align: center; gap: 4rem; padding: 4rem 0; }
            .hero h1 { font-size: 3rem; }
            .hero-btns { justify-content: center; }
            .hero p { margin: 0 auto 3rem; }
            .stats-strip { grid-template-columns: repeat(2, 1fr); padding: 2rem; border-radius: 20px; }
            .material-preview-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .section-header h2 { font-size: 2.2rem; }
            .card-image { height: 250px; }
            .about-img-premium { height: 350px; }
        }
      `}} />
        </div>
    );
};

export default Home;
