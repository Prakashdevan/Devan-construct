import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { Mail, Trash2, CheckCircle, Clock } from 'lucide-react';

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await API.get('/api/contact');
            setLeads(res.data);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/api/contact/${id}`, { status });
            fetchLeads();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const deleteLead = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            await API.delete(`/api/contact/${id}`);
            fetchLeads();
        } catch (err) {
            console.error('Error deleting lead:', err);
        }
    };

    if (loading) return <div className="p-8">Loading leads...</div>;

    return (
        <div className="leads-view">
            {/* Desktop Table View */}
            <div className="table-container desktop-only">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            <tr key={lead._id}>
                                <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                                <td><strong>{lead.name}</strong></td>
                                <td>
                                    <a href={`mailto:${lead.email}`} className="email-link">
                                        <Mail size={14} /> {lead.email}
                                    </a>
                                </td>
                                <td><div className="msg-preview">{lead.message}</div></td>
                                <td>
                                    <span className={`status-badge ${lead.status.toLowerCase()}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions">
                                        {lead.status === 'New' && (
                                            <button onClick={() => updateStatus(lead._id, 'Read')} title="Mark as Read">
                                                <CheckCircle size={18} className="text-success" />
                                            </button>
                                        )}
                                        <button onClick={() => deleteLead(lead._id)} title="Delete">
                                            <Trash2 size={18} className="text-danger" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lead-cards mobile-only">
                {leads.length === 0 ? (
                    <div className="empty-state">No inquiries yet</div>
                ) : (
                    leads.map((lead) => (
                        <div key={lead._id} className="lead-card glass-effect">
                            <div className="card-header">
                                <div className="lead-info">
                                    <span className="lead-date">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                    <strong>{lead.name}</strong>
                                </div>
                                <span className={`status-badge ${lead.status.toLowerCase()}`}>
                                    {lead.status}
                                </span>
                            </div>
                            <div className="card-body">
                                <a href={`mailto:${lead.email}`} className="email-link">
                                    <Mail size={14} /> {lead.email}
                                </a>
                                <p className="lead-msg">{lead.message}</p>
                            </div>
                            <div className="card-footer">
                                {lead.status === 'New' && (
                                    <button className="btn-action-mobile success" onClick={() => updateStatus(lead._id, 'Read')}>
                                        <CheckCircle size={18} /> Mark Read
                                    </button>
                                )}
                                <button className="btn-action-mobile danger" onClick={() => deleteLead(lead._id)}>
                                    <Trash2 size={18} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .leads-view { padding: 1rem 0; }
        .desktop-only { display: block; }
        .mobile-only { display: none; }

        @media (max-width: 992px) {
            .desktop-only { display: none; }
            .mobile-only { display: block; }

            .lead-cards { display: flex; flex-direction: column; gap: 1rem; padding: 0 1rem 2rem; }
            .lead-card { padding: 1.2rem; border-radius: 20px; background: white; border: 1px solid #eee; display: flex; flex-direction: column; gap: 1rem; }
            
            .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
            .lead-info { display: flex; flex-direction: column; }
            .lead-date { font-size: 0.75rem; color: #888; font-weight: 700; text-transform: uppercase; }
            .lead-info strong { font-size: 1.1rem; color: var(--primary); }
            
            .card-body { display: flex; flex-direction: column; gap: 0.8rem; }
            .lead-msg { font-size: 0.95rem; color: #444; line-height: 1.5; padding: 12px; background: #f9f9f9; border-radius: 12px; margin: 0; }
            
            .card-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border-top: 1px solid #f0f0f0; padding-top: 1rem; }
            .btn-action-mobile { padding: 10px; border-radius: 10px; border: 1px solid #eee; background: white; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }
            .btn-action-mobile.success { color: #52c41a; border-color: #f6ffed; }
            .btn-action-mobile.danger { color: #ff4d4f; border-color: #fff1f0; }

            .empty-state { text-align: center; padding: 3rem; color: #888; font-weight: 500; }
        }

        .email-link { display: flex; align-items: center; gap: 6px; color: var(--accent-hover); text-decoration: none; font-size: 0.9rem; font-weight: 500; }
        .msg-preview { max-width: 300px; font-size: 0.9rem; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        
        .status-badge { 
            padding: 4px 10px; 
            border-radius: 6px; 
            font-size: 0.75rem; 
            font-weight: 700; 
            text-transform: uppercase; 
        }
        .status-badge.new { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
        .status-badge.read { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
        
        .actions { display: flex; gap: 15px; }
        .actions button { background: none; border: none; cursor: pointer; padding: 4px; transition: transform 0.2s; }
        .actions button:hover { transform: scale(1.1); }
        .text-success { color: #52c41a; }
        .text-danger { color: #ff4d4f; }
      `}} />
        </div>
    );
};

export default Leads;
