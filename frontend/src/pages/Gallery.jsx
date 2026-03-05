import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const Gallery = () => {
    const { t } = useLanguage();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await API.get('/api/gallery');
            setImages(res.data);
        } catch (err) {
            console.error('Error fetching gallery', err);
        } finally {
            setLoading(false);
        }
    };

    const fallbackImages = [
        { url: '/steel_sheets_blue.png', title: t('gallery.t1') },
        { url: '/steel_sheets_grey.png', title: t('gallery.t2') },
        { url: '/plywood_red.png', title: t('gallery.t3') }
    ];

    const displayImages = images.length > 0 ? images : fallbackImages;

    return (
        <div className="gallery-page">
            <header className="page-header animate-fade-in">
                <h1>{t('gallery.header')}</h1>
                <p>{t('gallery.subtitle')}</p>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>Loading gallery...</div>
            ) : (
                <div className="gallery-grid">
                    {displayImages.map((img, i) => (
                        <div key={img._id || i} className="gallery-item glass-effect">
                            <img src={img.url} alt={img.title} />
                            <div className="img-overlay">
                                <h4>{img.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .gallery-page { padding: 4rem 5 %; max-width: 1200px; margin: 0 auto; }
        .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 3rem; }
        .gallery-item { position: relative; border-radius: 20px; overflow: hidden; height: 300px; border: 1px solid #eee; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .gallery-item:hover img { transform: scale(1.1); }
        .img-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 1.5rem;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
            color: white;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .gallery-item:hover .img-overlay { opacity: 1; }

        @media (max-width: 992px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 576px) {
          .gallery-grid { grid-template-columns: 1fr; }
        }
      `}} />
        </div>
    );
};

export default Gallery;
