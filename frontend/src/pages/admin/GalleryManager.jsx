import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const GalleryManager = () => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await API.get('/api/gallery');
            setImages(res.data);
        } catch (err) {
            console.error('Error fetching gallery', err);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a file');

        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title);

        setUploading(true);
        try {
            const res = await API.post('/api/gallery/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setImages([res.data, ...images]);
            setFile(null);
            setTitle('');
            alert('Photo uploaded successfully!');
        } catch (err) {
            console.error('Upload failed', err);
            alert('Upload failed. Check server logs.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;
        try {
            await API.delete(`/api/gallery/${id}`);
            setImages(images.filter(img => img._id !== id));
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    return (
        <div className="gallery-manager">
            <div className="upload-section glass-effect">
                <form onSubmit={handleUpload} className="upload-content">
                    <div className="upload-icon-box">
                        <Upload size={32} />
                    </div>
                    <h3>Upload Work Progress</h3>
                    <p>Select a photo showing site progress</p>

                    <div className="form-inputs">
                        <input
                            type="text"
                            placeholder="Image Title (e.g. Slab Centering - Site A)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="file-input"
                            id="gallery-file"
                        />
                        <label htmlFor="gallery-file" className="file-label">
                            {file ? file.name : 'Choose Image'}
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-secondary"
                        disabled={uploading || !file}
                    >
                        {uploading ? <><Loader2 size={18} className="spin" /> Uploading...</> : 'Upload Photo'}
                    </button>
                </form>
            </div>

            <div className="gallery-admin-grid">
                {images.length === 0 ? (
                    <div className="empty-state">No images uploaded yet.</div>
                ) : (
                    images.map((img) => (
                        <div key={img._id} className="gallery-admin-item glass-effect">
                            <img src={img.url} alt={img.title} />
                            <div className="item-overlay">
                                <span className="title-text">{img.title}</span>
                                <button
                                    onClick={() => handleDelete(img._id)}
                                    className="delete-btn"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .upload-section { padding: 3rem 2rem; border-radius: 24px; text-align: center; border: 2px dashed #eee; margin-bottom: 3rem; background: white; }
        .upload-icon-box { width: 60px; height: 60px; background: rgba(255,180,0,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: var(--accent); }
        .upload-content h3 { margin-bottom: 0.5rem; font-weight: 800; }
        .upload-content p { color: #888; font-size: 0.9rem; margin-bottom: 1.5rem; }

        .form-inputs { display: flex; flex-direction: column; gap: 1rem; max-width: 400px; margin: 0 auto 1.5rem; }
        .input-field { padding: 0.8rem; border-radius: 10px; border: 1px solid #eee; width: 100%; font-size: 0.9rem; }
        .file-input { display: none; }
        .file-label { padding: 0.8rem; border-radius: 10px; border: 1px solid var(--accent); color: var(--accent); cursor: pointer; font-weight: 600; font-size: 0.9rem; background: transparent; transition: all 0.2s; }
        .file-label:hover { background: var(--accent); color: white; }

        .gallery-admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .gallery-admin-item { position: relative; border-radius: 18px; overflow: hidden; height: 200px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .gallery-admin-item img { width: 100%; height: 100%; object-fit: cover; }
        .item-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); opacity: 1; transition: opacity 0.3s; display: flex; align-items: flex-end; padding: 1.2rem; color: white; }
        .title-text { font-weight: 600; font-size: 0.9rem; }
        
        .delete-btn { position: absolute; top: 12px; right: 12px; background: rgba(255, 77, 79, 0.9); color: white; border: none; border-radius: 8px; padding: 6px; cursor: pointer; transition: transform 0.2s; }
        .delete-btn:hover { transform: scale(1.1); background: #ff4d4f; }

        .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem; color: #888; font-style: italic; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
            .upload-section { padding: 2rem 1rem; border-radius: 20px; margin: 1rem; }
            .form-inputs { max-width: none; width: 100%; }
            .gallery-admin-grid { grid-template-columns: 1fr; padding: 0 1rem 2rem; }
            .gallery-admin-item { height: 250px; border-radius: 24px; }
            .btn-secondary { width: 100%; justify-content: center; padding: 1rem; }
        }
      `}} />
        </div>
    );
};

export default GalleryManager;
