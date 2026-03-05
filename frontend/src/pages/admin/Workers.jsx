import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Workers = () => {
    const { token } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentWorkerId, setCurrentWorkerId] = useState(null);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        specialization: 'Slab',
        dailyWage: '',
        site: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    // Filter workers based on search term
    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.phone.includes(searchTerm) ||
        (w.specialization && w.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const fetchData = async () => {
        try {
            setLoading(true);
            const [workersRes, sitesRes] = await Promise.all([
                API.get('/api/workers?all=true'),
                API.get('/api/sites')
            ]);
            setWorkers(workersRes.data);
            setSites(sitesRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
            setError('Failed to load data from server');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isEditing) {
                await API.put(`/api/workers/${currentWorkerId}`, formData);
            } else {
                await API.post('/api/workers', formData);
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            console.error('Error saving worker', err);
            setError(err.response?.data?.message || 'Error saving worker data');
        }
    };

    const handleEdit = (worker) => {
        setFormData({
            name: worker.name,
            phone: worker.phone,
            specialization: worker.specialization,
            dailyWage: worker.dailyWage,
            site: worker.site?._id || '',
            isActive: worker.isActive
        });
        setCurrentWorkerId(worker._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this worker?')) return;
        try {
            await API.delete(`/api/workers/${id}`);
            fetchData();
        } catch (err) {
            console.error('Error deleting worker', err);
            setError('Failed to delete worker');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            specialization: 'Slab',
            dailyWage: '',
            site: '',
            isActive: true
        });
        setIsEditing(false);
        setCurrentWorkerId(null);
        setError('');
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    return (
        <div className="workers-page">
            <div className="page-actions glass-effect">
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search workers by name, phone or skill..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} /> Add New Worker
                </button>
            </div>

            {error && <div className="error-banner"><AlertCircle size={18} /> {error}</div>}

            <div className="workers-content">
                {loading ? (
                    <div className="loading">Loading workers...</div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="table-container desktop-only">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Worker Name</th>
                                        <th>Contact</th>
                                        <th>Specialization</th>
                                        <th>Daily Wage</th>
                                        <th>Site</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWorkers.length === 0 ? (
                                        <tr><td colSpan="7" className="empty-state">No workers matching your search</td></tr>
                                    ) : (
                                        filteredWorkers.map(w => (
                                            <tr key={w._id}>
                                                <td style={{ fontWeight: 600 }}>{w.name}</td>
                                                <td>{w.phone}</td>
                                                <td><span className="badge-light">{w.specialization}</span></td>
                                                <td>₹{w.dailyWage}</td>
                                                <td>{w.site?.name || 'Unassigned'}</td>
                                                <td>
                                                    <span className={`status-pill ${w.isActive ? 'active' : 'inactive'}`}>
                                                        {w.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions">
                                                        <button className="icon-btn edit" onClick={() => handleEdit(w)}><Edit2 size={16} /></button>
                                                        <button className="icon-btn delete" onClick={() => handleDelete(w._id)}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="worker-cards mobile-only">
                            {filteredWorkers.length === 0 ? (
                                <div className="empty-state">No workers matching your search</div>
                            ) : (
                                filteredWorkers.map(w => (
                                    <div key={w._id} className="worker-card glass-effect">
                                        <div className="card-header">
                                            <div className="worker-info">
                                                <strong>{w.name}</strong>
                                                <span className="worker-spec">{w.specialization}</span>
                                            </div>
                                            <span className={`status-pill ${w.isActive ? 'active' : 'inactive'}`}>
                                                {w.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <div className="info-item">
                                                <span className="label">Contact:</span>
                                                <span className="value">{w.phone}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Wage:</span>
                                                <span className="value">₹{w.dailyWage}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Site:</span>
                                                <span className="value">{w.site?.name || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <button className="btn-card-action edit" onClick={() => handleEdit(w)}>
                                                <Edit2 size={16} /> Edit
                                            </button>
                                            <button className="btn-card-action delete" onClick={() => handleDelete(w._id)}>
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-effect">
                        <div className="modal-header">
                            <h3>{isEditing ? 'Edit Worker' : 'Add New Worker'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="worker-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Worker Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Mobile Number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Daily Wage (₹)</label>
                                    <input
                                        type="number"
                                        name="dailyWage"
                                        value={formData.dailyWage}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="800"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Specialization</label>
                                    <select name="specialization" value={formData.specialization} onChange={handleInputChange}>
                                        <option value="Slab">Slab Centering</option>
                                        <option value="Beam">Beam Centering</option>
                                        <option value="Column">Column Centering</option>
                                        <option value="Helper">Helper</option>
                                        <option value="Maistry">Maistry</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Assign Site</label>
                                    <select name="site" value={formData.site} onChange={handleInputChange}>
                                        <option value="">Unassigned</option>
                                        {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                        />
                                        Active Worker
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Update Worker' : 'Save Worker'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .workers-page { padding: 1rem 0; }
                .page-actions { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 2rem; border-radius: 20px; gap: 2rem; }
                
                .search-bar { display: flex; align-items: center; background: #f8f9fa; border: 1px solid #eee; border-radius: 12px; padding: 0 15px; flex: 1; max-width: 500px; transition: all 0.3s; }
                .search-bar:focus-within { background: white; border-color: #4facfe; box-shadow: 0 0 0 4px rgba(79, 172, 254, 0.1); }
                .search-bar input { border: none; background: transparent; padding: 12px; width: 100%; outline: none; font-size: 0.95rem; }
                .search-icon { color: #888; }

                .error-banner { background: #fff1f0; color: #ff4d4f; padding: 12px 20px; border-radius: 12px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border: 1px solid #ffa39e; font-weight: 600; }
                
                .badge-light { background: #f0f7ff; color: #4facfe; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; border: 1px solid #e1f0ff; }
                .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                .status-pill.active { background: #e6fffa; color: #33d391; border: 1px solid #b2f5ea; }
                .status-pill.inactive { background: #fff5f5; color: #ff4d4f; border: 1px solid #fed7d7; }
                
                .actions { display: flex; gap: 12px; }
                .icon-btn { border: 1px solid #eee; background: white; cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .icon-btn.edit { color: #4facfe; }
                .icon-btn.edit:hover { background: #4facfe; color: white; border-color: #4facfe; }
                .icon-btn.delete { color: #ff4d4f; }
                .icon-btn.delete:hover { background: #ff4d4f; color: white; border-color: #ff4d4f; }
                
                .loading, .empty-state { text-align: center; padding: 4rem; color: #888; font-weight: 500; font-size: 1rem; }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s; }
                .modal-content { width: 100%; max-width: 600px; padding: 2.5rem; border-radius: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.8); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
                .modal-header h3 { font-size: 1.5rem; font-weight: 800; }
                .close-btn { background: none; border: none; cursor: pointer; color: #888; border-radius: 50%; padding: 8px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
                .close-btn:hover { background: #f5f5f5; color: #333; }

                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.6rem; }
                .form-group label { font-weight: 700; font-size: 0.9rem; color: var(--text-main); }
                .form-group input, .form-group select { padding: 0.9rem 1.2rem; border-radius: 12px; border: 1px solid #eee; background: #fafafa; font-size: 1rem; transition: border-color 0.2s; }
                .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--accent); background: white; }
                
                .checkbox-group { justify-content: center; padding-top: 1.8rem; }
                .checkbox-group label { display: flex; align-items: center; gap: 10px; cursor: pointer; }
                .checkbox-group input { width: auto; }

                .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem; }
                .btn-outline { background: white; border: 1px solid #eee; color: #666; font-weight: 600; padding: 0.8rem 1.5rem; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
                .btn-outline:hover { background: #f8f9fa; border-color: #ddd; }

                .desktop-only { display: block; }
                .mobile-only { display: none; }

                @media (max-width: 992px) { 
                    .desktop-only { display: none; }
                    .mobile-only { display: block; }

                    .page-actions { flex-direction: column; padding: 1rem; gap: 1rem; align-items: stretch; }
                    .search-bar { max-width: none; }
                    .btn-primary { width: 100%; justify-content: center; padding: 1rem; }

                    .worker-cards { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 2rem; }
                    .worker-card { padding: 1.2rem; border-radius: 20px; background: white; border: 1px solid #eee; display: flex; flex-direction: column; gap: 1rem; }
                    
                    .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
                    .worker-info { display: flex; flex-direction: column; }
                    .worker-info strong { font-size: 1.1rem; color: var(--primary); }
                    .worker-spec { font-size: 0.8rem; color: #888; text-transform: uppercase; font-weight: 700; }
                    
                    .card-body { display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #fcfcfc; border-radius: 12px; }
                    .info-item { display: flex; justify-content: space-between; font-size: 0.9rem; }
                    .info-item .label { color: #888; font-weight: 600; }
                    .info-item .value { font-weight: 700; color: var(--text-main); }
                    
                    .card-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border-top: 1px solid #f0f0f0; pt: 1rem; }
                    .btn-card-action { padding: 10px; border-radius: 10px; border: 1px solid #eee; background: white; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }
                    .btn-card-action.edit { color: #4facfe; border-color: #e1f0ff; }
                    .btn-card-action.delete { color: #ff4d4f; border-color: #ffe6e6; }

                    .form-grid { grid-template-columns: 1fr; gap: 1rem; } 
                    .modal-content { padding: 1.5rem; margin: 1rem; border-radius: 20px; }
                    .modal-header h3 { font-size: 1.2rem; }
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                `
            }} />
        </div>
    );
};

export default Workers;
