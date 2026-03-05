import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
    CartesianGrid
} from 'recharts';

import { useAuth } from '../../context/AuthContext';
import { RefreshCw, X } from 'lucide-react';

const Overview = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState([
        { label: 'Total Workers', value: '0', change: '+0', color: '#4facfe' },
        { label: 'Present Today', value: '0', change: '0%', color: '#33d391' },
        { label: 'Active Sites', value: '0', change: 'Ongoing', color: '#ffb400' },
        { label: 'Total Projects', value: '0', change: '+0', color: '#8e44ad' },
    ]);

    const [attendanceData, setAttendanceData] = useState([]);
    const [specializationData, setSpecializationData] = useState([]);
    const [dayDetails, setDayDetails] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchDashboardData = async () => {
        if (!token) return;
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            console.log('Fetching dashboard data...');
            const [workersRes, sitesRes, attendanceStatsRes, specRes, wageRes] = await Promise.all([
                axios.get('http://localhost:5000/api/workers', config).catch(() => ({ data: [] })),
                axios.get('http://localhost:5000/api/sites', config).catch(() => ({ data: [] })),
                axios.get('http://localhost:5000/api/attendance/stats', config).catch(() => ({ data: [] })),
                axios.get('http://localhost:5000/api/workers/stats/specialization', config).catch(() => ({ data: [] })),
                axios.get('http://localhost:5000/api/attendance/daily-expense', config).catch(() => ({ data: { presentCount: 0 } }))
            ]);

            console.log('Backend Data Loaded:', {
                attendance: attendanceStatsRes.data?.length,
                spec: specRes.data?.length
            });

            setStats([
                { label: 'Total Workers', value: workersRes.data?.length.toString() || '0', change: '+0', color: '#4facfe' },
                { label: 'Present Today', value: wageRes.data?.presentCount.toString() || '0', change: 'Live', color: '#33d391' },
                { label: 'Active Sites', value: (sitesRes.data?.filter(s => s.status?.toLowerCase() === 'active').length || 0).toString(), change: 'Ongoing', color: '#ffb400' },
                { label: 'Total Projects', value: sitesRes.data?.length.toString() || '0', change: 'Total', color: '#8e44ad' },
            ]);

            if (attendanceStatsRes.data && Array.isArray(attendanceStatsRes.data)) {
                setAttendanceData(attendanceStatsRes.data.map(item => ({
                    name: item._id,
                    present: item.present || 0,
                    salary: item.totalSalary || 0
                })));
            }

            if (specRes.data && Array.isArray(specRes.data)) {
                const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
                setSpecializationData(specRes.data.map((item, index) => ({
                    name: item._id || 'Other',
                    value: item.count || 0,
                    color: colors[index % colors.length]
                })));
            }
        } catch (err) {
            console.error('Error fetching dashboard stats', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBarClick = async (data) => {
        if (!data || !data.name) return;
        setSelectedDate(data.name);
        setDetailsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`http://localhost:5000/api/attendance/day-details/${data.name}`, config);
            setDayDetails(res.data);
        } catch (err) {
            console.error('Error fetching day details', err);
        } finally {
            setDetailsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    return (
        <div className="overview-container">
            <div style={{
                marginBottom: '2.5rem',
                background: 'white',
                padding: '2rem',
                borderRadius: '24px',
                boxShadow: 'var(--shadow)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(0,0,0,0.03)'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                        Welcome back, <span style={{ color: 'var(--accent)' }}>Admin</span>
                    </h1>
                    <p style={{ color: '#666', fontSize: '1rem', fontWeight: 500 }}>
                        Monitoring Devan Construction's performance.
                    </p>
                </div>
                <div style={{ textAlign: 'right', background: '#f8f9fa', padding: '12px 20px', borderRadius: '15px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                        Today's Overview
                    </p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#333' }}>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="stats-container">
                {stats.map((s) => (
                    <div key={s.label} className="stat-card glass-effect" style={{ borderTop: `4px solid ${s.color}` }}>
                        <p className="stat-label">{s.label}</p>
                        <div className="stat-value-row">
                            <h3>{s.value}</h3>
                            <span className="stat-change">{s.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Attendance & Salary Charts Row */}
            <div className="charts-mock-row">
                <div className="chart-card glass-effect">
                    <div className="chart-header-row">
                        <h4>Attendance Trends</h4>
                        <span className="hint">Click bar to view names</span>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={attendanceData}
                                onClick={(state) => {
                                    if (state && state.activePayload) {
                                        handleBarClick(state.activePayload[0].payload);
                                    }
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'rgba(51, 211, 145, 0.05)' }} />
                                <Bar dataKey="present" fill="#33d391" radius={[4, 4, 0, 0]} cursor="pointer" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card glass-effect">
                    <h4>Daily Salary Expense</h4>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'rgba(79, 172, 254, 0.05)' }} />
                                <Bar dataKey="salary" fill="#4facfe" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Specialization Pie Chart Row */}
            <div className="secondary-charts-row">
                <div className="chart-card glass-effect pie-container">
                    <h4>Workforce Distribution</h4>
                    <div className="chart-wrapper">
                        {specializationData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={specializationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {specializationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data">No workers found.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Attendance Detail Modal */}
            {selectedDate && (
                <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
                    <div className="modal-content glass-effect details-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Present on {selectedDate}</h3>
                            <button className="close-btn" onClick={() => setSelectedDate(null)}><X size={20} /></button>
                        </div>
                        <div className="details-list">
                            {detailsLoading ? (
                                <div className="loading-state">
                                    <RefreshCw className="spinner" size={24} />
                                    <span>Fetching names...</span>
                                </div>
                            ) : dayDetails.length > 0 ? (
                                <div className="names-grid">
                                    {dayDetails.map((worker, i) => (
                                        <div key={i} className="worker-detail-item">
                                            <span className="dot"></span>
                                            <span className="name">{worker.name}</span>
                                            <span className={`status-tag ${worker.status.toLowerCase()}`}>{worker.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">No workers marked present on this day.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .overview-container { animation: fadeIn 0.5s ease-out; padding-bottom: 2rem; }
        .welcome-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .welcome-header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .welcome-header p { color: #666; font-size: 1.1rem; }

        .refresh-btn { display: flex; align-items: center; gap: 8px; padding: 0.8rem 1.2rem; border-radius: 12px; font-weight: 700; transition: all 0.3s; background: #fff; border: 1px solid #ddd; cursor: pointer; }
        .refresh-btn:hover:not(:disabled) { background: #f0f0f0; transform: translateY(-1px); }
        .refresh-btn.loading svg { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .stats-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { padding: 1.5rem; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); background: white; border: 1px solid #eee; }
        .stat-label { font-size: 0.85rem; color: #888; font-weight: 600; margin-bottom: 0.5rem; }
        .stat-value-row { display: flex; align-items: flex-end; gap: 10px; }
        .stat-value-row h3 { font-size: 2rem; font-weight: 900; margin: 0; }
        .stat-change { font-size: 0.8rem; color: #33d391; font-weight: 700; margin-bottom: 4px; }

        .charts-mock-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
        .secondary-charts-row { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        .chart-card { padding: 2rem; border-radius: 24px; min-height: 400px; background: white; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.01); }
        .chart-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .chart-header-row h4 { margin: 0; font-weight: 800; color: #333; font-size: 1.1rem; }
        .chart-card h4 { margin-bottom: 2rem; font-weight: 800; color: #333; font-size: 1.1rem; }
        .hint { font-size: 0.75rem; color: #aaa; font-weight: 500; font-style: italic; }
        .chart-wrapper { width: 100%; height: 300px; display: flex; align-items: center; justify-content: center; }
        .no-data { color: #aaa; font-style: italic; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 3000; display: flex; align-items: center; justify-content: center; }
        .details-modal { width: 90%; max-width: 550px; padding: 2.5rem; border-radius: 32px; background: rgba(255,255,255,0.95); animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-header h3 { font-weight: 800; font-size: 1.3rem; }
        .close-btn { background: #f5f5f5; border: none; padding: 8px; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .close-btn:hover { background: #eee; }

        .details-list { max-height: 400px; overflow-y: auto; padding-right: 10px; }
        .names-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .worker-detail-item { display: flex; align-items: center; gap: 10px; padding: 12px 15px; background: #f8f9fa; border-radius: 16px; transition: transform 0.2s; border: 1px solid #f0f0f0; }
        .worker-detail-item:hover { transform: scale(1.02); background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #33d391; }
        .worker-detail-item .name { flex: 1; font-weight: 700; font-size: 0.95rem; }
        .status-tag { font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
        .status-tag.present { background: #e6fffa; color: #33d391; }
        .status-tag.half-day { background: #fffaf0; color: #ffb400; }

        .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; color: #888; }
        .spinner { animation: rotate 1s linear infinite; }
        .empty-state { text-align: center; padding: 3rem; color: #aaa; font-style: italic; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        @media (max-width: 1200px) {
          .stats-container { grid-template-columns: repeat(2, 1fr); }
          .charts-mock-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .stats-container { grid-template-columns: 1fr; }
          .welcome-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .names-grid { grid-template-columns: 1fr; }
        }
        .overview-container { animation: slideUp 0.6s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .welcome-title {
            background: linear-gradient(135deg, #1a1a1a 0%, #666 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}} />
        </div>
    );
};

export default Overview;
