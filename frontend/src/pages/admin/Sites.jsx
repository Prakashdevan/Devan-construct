import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Calendar, CheckCircle2, Clock, Plus, X, Edit2, Trash2 } from 'lucide-react';

const Sites = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSiteId, setCurrentSiteId] = useState(null);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        clientName: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/sites', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSites(res.data);
        } catch (err) {
            console.error('Error fetching sites', err);
            setError('Failed to load sites');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/sites/${currentSiteId}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/sites', formData, config);
            }
            setShowModal(false);
            resetForm();
            fetchSites();
        } catch (err) {
            console.error('Error saving site', err);
            setError(err.response?.data?.message || 'Error saving site data');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this site?')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Session expired. Please login again.');
                    return;
                }
                await axios.delete(`http://localhost:5000/api/sites/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchSites();
                alert('Site deleted successfully!');
            } catch (err) {
                console.error('Error deleting site', err);
                const msg = err.response?.data?.message || 'Failed to delete site';
                setError(msg);
                alert('Error: ' + msg);
            }
        }
    };

    const handleEdit = (site) => {
        setFormData({
            name: site.name,
            location: site.location,
            clientName: site.clientName,
            status: site.status
        });
        setCurrentSiteId(site._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            location: '',
            clientName: '',
            status: 'Active'
        });
        setIsEditing(false);
        setCurrentSiteId(null);
        setError('');
    };

    return (
        <div className="sites-page">
            <div className="page-actions">
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} /> Add New Site
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading">Loading sites...</div>
            ) : (
                <div className="sites-grid">
                    {sites.length === 0 ? (
                        <div className="empty-state">No sites found. Add your first construction site.</div>
                    ) : (
                        sites.map(site => (
                            <div key={site._id} className="site-card glass-effect">
                                <div className="site-header">
                                    <MapPin size={20} className="site-icon" />
                                    <h3>{site.name}</h3>
                                    <span className={`status-badge ${site.status.toLowerCase()}`}>{site.status}</span>
                                </div>
                                <div className="site-details">
                                    <p><strong>Location:</strong> {site.location}</p>
                                    <p><strong>Client:</strong> {site.clientName}</p>
                                </div>
                                <div className="site-footer">
                                    <div className="date-info">
                                        <Calendar size={14} />
                                        <span>Start: {new Date(site.startDate || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="actions">
                                        <button className="icon-btn edit" onClick={() => handleEdit(site)}><Edit2 size={14} /></button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(site._id)}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-effect">
                        <div className="modal-header">
                            <h3>{isEditing ? 'Edit Site' : 'Add New Site'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="site-form">
                            <div className="form-group">
                                <label>Site Name</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Skyline Residency" />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input name="location" value={formData.location} onChange={handleInputChange} required placeholder="City or Area" />
                            </div>
                            <div className="form-group">
                                <label>Client Name</label>
                                <input name="clientName" value={formData.clientName} onChange={handleInputChange} required placeholder="Client or Company" />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="On Hold">On Hold</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{isEditing ? 'Update Site' : 'Save Site'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .sites-page { padding: 1rem 0; }
                .page-actions { margin-bottom: 2rem; display: flex; justify-content: flex-end; }
                .error-banner { background: #fff1f0; color: #ff4d4f; padding: 10px; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #ffa39e; }
                
                .sites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
                .site-card { padding: 1.8rem; border-radius: 24px; display: flex; flex-direction: column; gap: 1.2rem; transition: transform 0.2s; }
                .site-card:hover { transform: translateY(-5px); }
                
                .site-header { display: flex; align-items: center; gap: 12px; }
                .site-icon { color: var(--accent); }
                .site-header h3 { font-size: 1.25rem; flex: 1; font-weight: 800; }
                
                .status-badge { font-size: 0.7rem; padding: 5px 10px; border-radius: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                .status-badge.active { background: #e6fffa; color: #33d391; }
                .status-badge.completed { background: #ebf8ff; color: #4facfe; }
                .status-badge.on { background: #fff5f5; color: #ff4d4f; }
                
                .site-details p { font-size: 0.95rem; color: #666; margin-bottom: 0.4rem; }
                .site-footer { margin-top: auto; padding-top: 1.2rem; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
                .date-info { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #888; }
                
                .actions { display: flex; gap: 8px; }
                .icon-btn { border: 1px solid #eee; background: white; cursor: pointer; padding: 6px; border-radius: 8px; color: #4facfe; transition: all 0.2s; }
                .icon-btn:hover { background: #4facfe; color: white; border-color: #4facfe; }
                .icon-btn.delete:hover { background: #ff4d4f; border-color: #ff4d4f; }

                /* Reuse modal styles from Workers.jsx or define globally in index.css */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .modal-content { width: 90%; max-width: 500px; padding: 2.5rem; border-radius: 30px; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.2rem; }
                .form-group label { font-weight: 700; font-size: 0.9rem; }
                .form-group input, .form-group select { padding: 0.9rem; border-radius: 12px; border: 1px solid #eee; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
            `}} />
        </div>
    );
};

export default Sites;
