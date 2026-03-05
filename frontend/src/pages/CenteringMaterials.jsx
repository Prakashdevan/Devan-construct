import React, { useEffect } from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CenteringMaterials = () => {
    const { t } = useLanguage();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const materials = [
        {
            id: 'steel',
            title: t('materials.steel.title'),
            description: t('materials.steel.desc'),
            features: [
                t('materials.steel.f1'),
                t('materials.steel.f2'),
                t('materials.steel.f3'),
                t('materials.steel.f4'),
                t('materials.steel.f5')
            ],
            specs: [
                { label: t('materials.steel.spec_width'), value: "600 mm" },
                { label: t('materials.steel.spec_len'), value: t('materials.steel.spec_len_val') }
            ],
            images: [
                "/steel_sheets_blue.png",
                "/steel_sheets_grey.png",
                "/steel_sheets_red.png"
            ]
        },
        {
            id: 'wood',
            title: t('materials.wood.title'),
            description: t('materials.wood.desc'),
            features: [
                t('materials.wood.f1'),
                t('materials.wood.f2'),
                t('materials.wood.f3'),
                t('materials.wood.f4'),
                t('materials.wood.f5')
            ],
            extraInfo: t('materials.wood.extra'),
            images: ["/plywood_red.png"]
        }
    ];

    return (
        <div className="materials-page">
            <header className="page-header animate-fade-in">
                <div className="section-badge">{t('materials.header_badge')}</div>
                <h1>{t('materials.header_title')}</h1>
                <p>{t('materials.header_subtitle')}</p>
            </header>

            <div className="materials-container">
                {materials.map((item, index) => (
                    <section key={item.id} className={`material-card ${index % 2 === 0 ? '' : 'reverse'} animate-slide-up`}>
                        <div className="material-gallery">
                            <div className="main-image-wrapper glass-effect">
                                <img src={item.images[0]} alt={item.title} className="main-img" />
                            </div>
                            {item.images.length > 1 && (
                                <div className="thumb-strip">
                                    {item.images.slice(1).map((img, i) => (
                                        <div key={i} className="thumb glass-effect">
                                            <img src={img} alt={`${item.title} variation`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="material-details">
                            <h2 className="text-accent">{item.title}</h2>
                            <p className="desc">{item.description}</p>

                            <div className="features-grid">
                                {item.features.map((feat, i) => (
                                    <div key={i} className="feat-item">
                                        <CheckCircle size={18} className="icon" />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>

                            {item.specs && (
                                <div className="specs-box glass-effect">
                                    <h4>{t('materials.std_sizes')}</h4>
                                    <div className="specs-list">
                                        {item.specs.map((spec, i) => (
                                            <div key={i} className="spec-row">
                                                <span className="label">{spec.label}:</span>
                                                <span className="value">{spec.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {item.extraInfo && (
                                <div className="info-box">
                                    <ShieldCheck size={20} className="text-accent" />
                                    <p>{item.extraInfo}</p>
                                </div>
                            )}
                        </div>
                    </section>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .materials-page { padding: 4rem 5%; max-width: 1400px; margin: 0 auto; }
                .page-header { text-align: center; margin-bottom: 6rem; }
                .page-header h1 { font-size: 3.5rem; font-weight: 900; margin-bottom: 1rem; letter-spacing: -2px; }
                .page-header p { color: #666; font-size: 1.2rem; max-width: 600px; margin: 0 auto; }
                .section-badge { 
                    color: var(--accent); 
                    font-weight: 800; 
                    font-size: 0.8rem; 
                    text-transform: uppercase; 
                    letter-spacing: 2px;
                    margin-bottom: 1rem;
                }

                .materials-container { display: flex; flex-direction: column; gap: 8rem; }
                
                .material-card { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 5rem; 
                    align-items: center; 
                }
                .material-card.reverse { direction: rtl; }
                .material-card.reverse .material-details { direction: ltr; }

                .material-gallery { display: flex; flex-direction: column; gap: 1.5rem; }
                .main-image-wrapper { 
                    border-radius: 40px; 
                    overflow: hidden; 
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    border: 1px solid rgba(0,0,0,0.03);
                }
                .main-img { width: 100%; height: 500px; object-fit: cover; transition: transform 0.5s; }
                .main-img:hover { transform: scale(1.05); }

                .thumb-strip { display: flex; gap: 1rem; }
                .thumb { 
                    flex: 1; 
                    height: 120px; 
                    border-radius: 20px; 
                    overflow: hidden; 
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .thumb img { width: 100%; height: 100%; object-fit: cover; }

                .material-details h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 1.5rem; letter-spacing: -1px; }
                .desc { color: #555; line-height: 1.8; font-size: 1.1rem; margin-bottom: 2rem; }

                .features-grid { 
                    display: grid; 
                    grid-template-columns: repeat(2, 1fr); 
                    gap: 1.2rem; 
                    margin-bottom: 2.5rem; 
                }
                .feat-item { display: flex; align-items: flex-start; gap: 12px; }
                .feat-item .icon { color: var(--accent); margin-top: 3px; shrink: 0; }
                .feat-item span { font-weight: 600; color: #333; font-size: 0.95rem; }

                .specs-box { 
                    background: #f8f9fa; 
                    padding: 2rem; 
                    border-radius: 25px; 
                    margin-bottom: 2rem;
                }
                .specs-box h4 { font-weight: 800; margin-bottom: 1rem; color: #1a1a1a; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; }
                .spec-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
                .spec-row:last-child { border: none; }
                .spec-row .label { color: #888; font-weight: 600; }
                .spec-row .value { color: #1a1a1a; font-weight: 700; }

                .info-box { 
                    display: flex; 
                    gap: 15px; 
                    background: rgba(255,180,0,0.05); 
                    padding: 1.5rem; 
                    border-radius: 20px;
                    border-left: 4px solid var(--accent);
                }
                .info-box p { margin: 0; font-weight: 600; color: #1a1a1a; font-style: italic; line-height: 1.6; }

                /* Animations */
                .animate-fade-in { animation: fadeIn 1s ease-out; }
                .animate-slide-up { animation: slideUp 0.8s ease-out backwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) {
                    .material-card { gap: 3rem; }
                    .material-details h2 { font-size: 2rem; }
                }

                @media (max-width: 912px) {
                    .material-card, .material-card.reverse { grid-template-columns: 1fr; gap: 3rem; direction: ltr; }
                    .material-details { direction: ltr; }
                    .features-grid { grid-template-columns: 1fr; }
                    .main-img { height: 350px; }
                    .page-header h1 { font-size: 2.5rem; }
                }
                `
            }} />
        </div>
    );
};

export default CenteringMaterials;
