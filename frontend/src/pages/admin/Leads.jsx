import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Trash2, CheckCircle, Clock } from 'lucide-react';

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/contact', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(res.data);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/contact/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeads();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const deleteLead = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/contact/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeads();
        } catch (err) {
            console.error('Error deleting lead:', err);
        }
    };

    if (loading) return <div className="p-8">Loading leads...</div>;

    return (
        <div className="leads-view">
            <div className="table-container">
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

            <style dangerouslySetInnerHTML={{
                __html: `
        .leads-view { padding: 1rem 0; }
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
