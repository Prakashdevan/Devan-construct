import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, UserCheck, Search, Filter, FileText, Trash2, XCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Attendance = () => {
    const { token } = useAuth();
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState('all');
    const getLocalDate = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };
    const [date, setDate] = useState(getLocalDate());
    const [workers, setWorkers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Midnight Watcher: Auto-refresh only when the system clock crosses midnight
    useEffect(() => {
        let lastCheckedDay = new Date().toISOString().split('T')[0];

        const checkDateChange = () => {
            const today = new Date().toISOString().split('T')[0];
            if (today !== lastCheckedDay) {
                console.log('Midnight passed! Refreshing to new day:', today);
                lastCheckedDay = today;
                setDate(today);
                window.location.reload();
            }
        };

        const interval = setInterval(checkDateChange, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);
    // date dependency removed so it doesn't trigger when user views history

    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.site?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/sites', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSites(res.data);
            } catch (err) {
                console.error('Error fetching sites', err);
            }
        };
        fetchSites();
    }, []);

    useEffect(() => {
        if (selectedSite && date) {
            fetchAttendance();
        }
    }, [selectedSite, date]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Fetch workers (backend default is now active only)
            const workersRes = await axios.get(`http://localhost:5000/api/workers`, config);
            const siteWorkers = workersRes.data.map(w => ({
                ...w,
                _id: w._id.toString()
            }));
            console.log('WORKERS FETCHED:', siteWorkers.map(w => w._id));

            let filteredList = siteWorkers;
            // Filter by site if a specific one is selected
            if (selectedSite && selectedSite !== 'all') {
                filteredList = siteWorkers.filter(w => w.site?._id === selectedSite);
            }
            setWorkers(filteredList);

            // Fetch existing attendance for this date
            // If 'all', we might need a global attendance fetch or just the site-specific one.
            // Let's assume we need an API that returns attendance for all workers on a date.
            const url = selectedSite === 'all'
                ? `http://localhost:5000/api/attendance/all/${date}`
                : `http://localhost:5000/api/attendance/${selectedSite}/${date}`;

            const attendanceRes = await axios.get(url, config);
            const attendanceMap = {};
            attendanceRes.data.forEach(a => {
                if (a.worker) {
                    const workerId = (typeof a.worker === 'object') ? a.worker._id.toString() : a.worker.toString();
                    attendanceMap[workerId] = { status: a.status, isPaid: a.isPaid };
                }
            });
            console.log('ATTENDANCE MAP CREATED:', Object.keys(attendanceMap));
            setAttendance(attendanceMap);
        } catch (err) {
            console.error('Error fetching attendance', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkMark = async (status) => {
        if (!window.confirm(`Mark all ${filteredWorkers.length} currently listed workers as ${status}?`)) return;

        // Optimistic UI update
        const newAttendance = { ...attendance };
        filteredWorkers.forEach(w => {
            if (!attendance[w._id]?.isPaid) {
                newAttendance[w._id] = { status, isPaid: false };
            }
        });
        setAttendance(newAttendance);

        try {
            // Process updates
            for (const w of filteredWorkers) {
                if (!attendance[w._id]?.isPaid) {
                    await axios.post('http://localhost:5000/api/attendance', {
                        worker: w._id,
                        site: w.site?._id || selectedSite,
                        date: date,
                        status: status
                    }, { headers: { Authorization: `Bearer ${token}` } });
                }
            }
        } catch (err) {
            console.error('Bulk update failed', err);
            alert('Some records failed to update. Please refresh.');
            fetchAttendance();
        }
    };

    const handleStatusChange = async (workerId, status, workerSiteId) => {
        const idStr = workerId.toString();
        let siteId = selectedSite === 'all' ? workerSiteId : selectedSite;

        if (!siteId) {
            alert('Worker has no assigned site. Please assign a site first.');
            return;
        }

        const oldAttendance = attendance[idStr];
        const isClearing = oldAttendance?.status === status;

        // Optimistic UI Update
        setAttendance(prev => {
            if (isClearing) {
                const newAtt = { ...prev };
                delete newAtt[idStr];
                return newAtt;
            } else {
                return { ...prev, [idStr]: { status: status, isPaid: false } };
            }
        });

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (isClearing) {
                await axios.delete(`http://localhost:5000/api/attendance/${idStr}/${date}`, config);
            } else {
                await axios.post('http://localhost:5000/api/attendance', {
                    worker: idStr,
                    site: siteId,
                    date: date,
                    status: status
                }, config);
            }
            // CRITICAL: Re-fetch from DB to confirm persistence
            fetchAttendance();
        } catch (err) {
            console.error('Attendance Failure:', err.response?.data || err.message);
            // Rollback on error
            setAttendance(prev => {
                if (oldAttendance) return { ...prev, [idStr]: oldAttendance };
                const newAtt = { ...prev };
                delete newAtt[idStr];
                return newAtt;
            });
            alert('[A1] ' + (err.response?.data?.message || 'Failed to update attendance. Please check your internet.'));
        }
    };

    const sendWhatsAppNotification = (worker, status, siteName) => {
        if (!worker.phone) {
            alert('Worker phone number not available.');
            return;
        }

        const message = `Hello ${worker.name},\n\nYour attendance for today (${date}) at *${siteName || 'Site'}* has been marked as *${status}*.\n\n- *DEVAN CONSTRUCTION*`;
        const encodedMsg = encodeURIComponent(message);

        let phone = worker.phone.replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;

        const url = `https://wa.me/${phone}?text=${encodedMsg}`;
        window.open(url, '_blank');
    };

    const sendSMSNotification = (worker, status, siteName) => {
        if (!worker.phone) {
            alert('Worker phone number not available.');
            return;
        }

        const message = `Hello ${worker.name}, Your attendance for today (${date}) at ${siteName || 'Site'} has been marked as ${status}. - DEVAN CONSTRUCTION`;
        const encodedMsg = encodeURIComponent(message);

        let phone = worker.phone.replace(/\D/g, '');
        const url = `sms:${phone}?body=${encodedMsg}`;
        window.location.href = url;
    };



    return (
        <div className="attendance-view">
            <div className="attendance-filters glass-effect">
                <div className="filter-group">
                    <label>Select Site</label>
                    <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}>
                        <option value="all">All</option>
                        {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="filter-group" style={{ flex: 1.5 }}>
                    <label>Search Worker</label>
                    <div className="search-input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Find worker by name or skill..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <Link to="/admin/reports" className="btn btn-secondary" style={{ padding: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FileText size={18} />
                        View Salary Reports
                    </Link>
                </div>
            </div>

            <div className="attendance-table table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Worker Name</th>
                            <th>Site</th>
                            <th>Specialization</th>
                            <th>Status</th>
                            <th>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span>Actions</span>
                                    <div className="bulk-actions">
                                        <button onClick={() => handleBulkMark('Present')} className="btn-bulk present" title="Mark all Present">All P</button>
                                        <button onClick={() => handleBulkMark('Half-day')} className="btn-bulk half" title="Mark all Half">All H</button>
                                        <button onClick={() => handleBulkMark('Absent')} className="btn-bulk absent" title="Mark all Absent">All A</button>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWorkers.map(w => (
                            <tr key={w._id}>
                                <td>{w.name}</td>
                                <td>
                                    {w.site?.name ? (
                                        <span className="badge-site">{w.site.name}</span>
                                    ) : (
                                        <span className="badge-warning" title="Worker has no site assigned. Go to Worker Edit to assign.">
                                            ⚠️ No Site
                                        </span>
                                    )}
                                </td>
                                <td><span className="badge-light">{w.specialization}</span></td>
                                <td>
                                    <div className="status-cell">
                                        <span className={`status-badge ${attendance[w._id]?.status?.toLowerCase() || 'unmarked'}`}>
                                            {attendance[w._id]?.status || 'Unmarked'}
                                        </span>
                                        {attendance[w._id]?.status && attendance[w._id]?.status !== 'Absent' && (
                                            <span className="wage-earned">
                                                ₹{attendance[w._id]?.status === 'One-and-half' ? w.dailyWage * 1.5 : (attendance[w._id]?.status === 'Present' ? w.dailyWage : w.dailyWage / 2)}
                                            </span>
                                        )}
                                        {attendance[w._id]?.isPaid && <span className="paid-tag">Paid & Archived</span>}
                                        {attendance[w._id]?.status && !attendance[w._id]?.isPaid && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <button
                                                    className="btn-notify-wa"
                                                    onClick={() => sendWhatsAppNotification(w, attendance[w._id].status, w.site?.name)}
                                                    title="Notify on WhatsApp"
                                                >
                                                    WhatsApp
                                                </button>
                                                <button
                                                    className="btn-notify-sms"
                                                    onClick={() => sendSMSNotification(w, attendance[w._id].status, w.site?.name)}
                                                    title="Notify via SMS"
                                                >
                                                    Normal Msg
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="attendance-actions">
                                    <button
                                        onClick={() => handleStatusChange(w._id, 'Present', w.site?._id)}
                                        className={`btn-sm present ${attendance[w._id]?.status === 'Present' ? 'active' : ''}`}
                                    >
                                        Present
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(w._id, 'Half-day', w.site?._id)}
                                        className={`btn-sm half ${attendance[w._id]?.status === 'Half-day' ? 'active' : ''}`}
                                    >
                                        Half
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(w._id, 'One-and-half', w.site?._id)}
                                        className={`btn-sm one-half ${attendance[w._id]?.status === 'One-and-half' ? 'active' : ''}`}
                                    >
                                        1.5 Day
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(w._id, 'Absent', w.site?._id)}
                                        className={`btn-sm absent ${attendance[w._id]?.status === 'Absent' ? 'active' : ''}`}
                                    >
                                        Absent
                                    </button>
                                    {attendance[w._id]?.status && (
                                        <button
                                            className="btn-clear-row"
                                            onClick={() => handleStatusChange(w._id, attendance[w._id].status, w.site?._id)}
                                            title="Clear attendance"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .attendance-filters { display: flex; gap: 2rem; padding: 1.5rem 2rem; border-radius: 20px; margin-bottom: 2rem; align-items: flex-end; }
        .filter-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .filter-group label { font-size: 0.8rem; font-weight: 700; color: #888; text-transform: uppercase; }
        .filter-group select, .filter-group input { padding: 0.8rem; border-radius: 10px; border: 1px solid #eee; background: white; outline: none; transition: border-color 0.2s; }
        .filter-group select:focus, .filter-group input:focus { border-color: #4facfe; }

        .search-input-wrapper { display: flex; align-items: center; background: white; border: 1px solid #eee; border-radius: 10px; padding: 0 12px; }
        .search-input-wrapper input { border: none !important; flex: 1; padding: 0.8rem !important; }
        .search-icon { color: #888; }

        .attendance-actions { display: flex; gap: 10px; }
        .btn-sm { padding: 6px 12px; border-radius: 8px; border: 1px solid #eee; background: white; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
        .btn-sm.present:hover { border-color: #33d391; color: #33d391; }
        .btn-sm.present.active { background: #33d391; color: white; border-color: #33d391; }
        .btn-sm.half:hover { border-color: #ffb400; color: #ffb400; }
        .btn-sm.half.active { background: #ffb400; color: white; border-color: #ffb400; }
        .btn-sm.one-half:hover { border-color: #8e44ad; color: #8e44ad; }
        .btn-sm.one-half.active { background: #8e44ad; color: white; border-color: #8e44ad; }
        .btn-sm.absent:hover { border-color: #ff4d4f; color: #ff4d4f; }
        .btn-sm.absent.active { background: #ff4d4f; color: white; border-color: #ff4d4f; }

        .status-badge.unmarked { background: #f0f0f0; color: #888; border: 1px solid #ddd; }
        .status-badge.present { background: #e6ffed; color: #28a745; border: 1px solid #28a745; }
        .status-badge.half-day { background: #fff8e1; color: #ffab00; border: 1px solid #ffab00; }
        .status-badge.one-and-half { background: #f3e5f5; color: #8e44ad; border: 1px solid #8e44ad; }
        .status-badge.absent { background: #fff1f0; color: #ff4d4f; border: 1px solid #ff4d4f; }
        
        .status-badge { padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 0.75rem; text-transform: capitalize; }
        
        .status-cell { display: flex; flex-direction: column; gap: 4px; }
        .wage-earned { font-size: 0.75rem; font-weight: 800; color: #33d391; }
        .badge-site { padding: 4px 10px; border-radius: 8px; background: #eef2ff; color: #6366f1; font-size: 0.75rem; font-weight: 700; }
        
        .lock-toggle { display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .lock-toggle:hover { transform: scale(1.05); }
        .btn-sm:disabled { cursor: not-allowed; opacity: 0.6; grayscale: 1; pointer-events: none; }
        .btn-sm:disabled.active { opacity: 1; grayscale: 0; filter: none; }
        .paid-tag { font-size: 0.65rem; color: #8e44ad; font-weight: 800; text-transform: uppercase; background: rgba(142, 68, 173, 0.1); padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
        
        .badge-warning { background: #fff1f0; color: #ff4d4f; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 0.7rem; border: 1px solid #ffa39e; }

        .btn-clear-row { background: none; border: none; color: #ff4d4f; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.6; transition: all 0.2s; padding: 4px; }
        .btn-clear-row:hover { opacity: 1; transform: scale(1.1); }
        .btn-clear-row:disabled { opacity: 0.2; cursor: not-allowed; }

        .bulk-actions { display: flex; gap: 4px; margin-top: 4px; }
        .btn-bulk { padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; border: 1px solid #ddd; background: #f8f9fa; cursor: pointer; font-weight: 700; text-transform: uppercase; transition: all 0.2s; }
        .btn-bulk.present:hover { background: #33d391; color: white; border-color: #33d391; }
        .btn-bulk.half:hover { background: #ffb400; color: white; border-color: #ffb400; }
         .btn-bulk.absent:hover { background: #ff4d4f; color: white; border-color: #ff4d4f; }

        .btn-notify-wa {
            margin-top: 8px;
            padding: 4px 10px;
            background: #25d366;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .btn-notify-wa:hover {
            background: #128c7e;
            transform: scale(1.05);
        }
        .btn-notify-sms {
            padding: 4px 10px;
            background: #4facfe;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .btn-notify-sms:hover {
            background: #0076ad;
            transform: scale(1.05);
        }
      `}} />
        </div>
    );
};

export default Attendance;
