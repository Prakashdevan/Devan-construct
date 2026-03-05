import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText, Calendar, Users, IndianRupee, ChevronDown, ChevronUp, FileCode, AlertTriangle, RefreshCw, X } from 'lucide-react';

const Reports = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [salaryData, setSalaryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedWorker, setExpandedWorker] = useState(null);
    const [error, setError] = useState(null);
    const [payoutDates, setPayoutDates] = useState([]);
    const [selectedPayout, setSelectedPayout] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetPassword, setResetPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [viewTab, setViewTab] = useState('current'); // 'current' or 'history'

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        fetchSalaryReport();
        fetchPayouts();
    }, [month, year, selectedPayout]);

    useEffect(() => {
        if (viewTab === 'history' && payoutDates.length > 0 && !selectedPayout) {
            setSelectedPayout(payoutDates[0]);
        }
    }, [viewTab, payoutDates]);

    const fetchPayouts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/attendance/payouts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayoutDates(res.data);
        } catch (err) {
            console.error('Error fetching payouts', err);
        }
    };

    const fetchSalaryReport = async () => {
        // If in history mode but no payout selected, don't fetch or clear data
        if (viewTab === 'history' && !selectedPayout) {
            setSalaryData([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            let url = `http://localhost:5000/api/attendance/worker-salary`;
            if (selectedPayout) {
                url += `?payoutDate=${encodeURIComponent(selectedPayout)}`;
            }
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSalaryData(res.data);
        } catch (err) {
            console.error('Error fetching salary report', err);
            setError('Failed to load salary data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setResetLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/attendance/reset',
                { password: resetPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Salary cycle reset successfully! All records archived.');
            setResetPassword('');
            setShowResetModal(false);

            if (res.data.payoutDate) {
                setSelectedPayout(res.data.payoutDate.toString());
                setViewTab('history');
            }

            fetchSalaryReport();
            fetchPayouts();
        } catch (err) {
            alert(err.response?.data?.message || 'Reset failed');
        } finally {
            setResetLoading(false);
        }
    };

    const downloadPDF = () => {
        try {
            const doc = new jsPDF();
            const reportMonth = months[month - 1];

            // Header Title
            doc.setFontSize(22);
            doc.setTextColor(26, 26, 26);
            doc.text("DEVAN CONSTRUCTION", 105, 20, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(102, 102, 102);
            doc.text(`Monthly Salary Report: ${reportMonth} ${year}`, 105, 30, { align: 'center' });

            // Summary Info
            const totalPayout = salaryData.reduce((acc, curr) => acc + curr.totalSalary, 0);
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Payout: Rs. ${totalPayout.toLocaleString('en-IN')}`, 14, 45);
            doc.text(`Total Workers: ${salaryData.length}`, 14, 52);
            doc.text(`Date Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 59);

            // Table Data
            const tableColumn = ["Worker Name", "Specialization", "Wage/Day", "Present", "Half-Day", "1.5 Day", "Total Salary"];
            const tableRows = salaryData.map(worker => [
                worker.name,
                worker.specialization,
                `Rs. ${worker.dailyWage}`,
                worker.presentDays,
                worker.halfDays,
                worker.oneHalfDays || 0,
                `Rs. ${worker.totalSalary.toLocaleString('en-IN')}`
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 70,
                theme: 'striped',
                headStyles: { fillColor: [255, 180, 0], textColor: [26, 26, 26], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [250, 250, 250] },
                margin: { top: 70 },
            });

            // Add Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount} - Devan Construction Management System`, 14, 285);
            }

            doc.save(`Salary_Report_${reportMonth}_${year}.pdf`);
        } catch (err) {
            console.error('PDF Generation Error:', err);
            alert('Error generating PDF: ' + err.message);
        }
    };

    const totalPayout = salaryData.reduce((acc, curr) => acc + curr.totalSalary, 0);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const handleDeleteAttendance = async (workerId, date) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY remove the attendance for ${new Date(date).toLocaleDateString()}? This will update the salary total.`)) return;

        try {
            await axios.delete(`http://localhost:5000/api/attendance/${workerId}/${date}`);
            fetchSalaryReport(); // Refresh the report data
            alert('Attendance record removed and salary updated.');
        } catch (err) {
            alert('[R1] ' + (err.response?.data?.message || 'Failed to remove record.'));
        }
    };

    return (
        <div className="reports-view">
            <div className="reports-tabs">
                <button
                    className={`tab-btn ${viewTab === 'current' ? 'active' : ''}`}
                    onClick={() => { setViewTab('current'); setSelectedPayout(''); }}
                >
                    <FileText size={18} /> Current Cycle
                </button>
                <button
                    className={`tab-btn ${viewTab === 'history' ? 'active' : ''}`}
                    onClick={() => setViewTab('history')}
                >
                    <Calendar size={18} /> Payout History
                </button>
            </div>

            <div className="reports-controls glass-effect">
                {viewTab === 'current' ? (
                    <div className="control-group" style={{ flex: 1 }}>
                        <label>Active Cycle</label>
                        <p style={{ margin: 0, fontWeight: 700, color: '#666' }}>Showing Cumulative Unpaid Attendance</p>
                    </div>
                ) : (
                    <div className="control-group" style={{ flex: 1 }}>
                        <label>Select Past Payout</label>
                        <select value={selectedPayout} onChange={(e) => setSelectedPayout(e.target.value)}>
                            <option value="">-- Select a Payout Date --</option>
                            {payoutDates.map((dateStr, i) => (
                                <option key={i} value={dateStr}>Archived on {new Date(dateStr).toLocaleString('en-IN')}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="summary-payout">
                    <span className="label">{viewTab === 'history' ? 'Archived Total' : 'Current Total'}</span>
                    <span className="value">₹{totalPayout.toLocaleString('en-IN')}</span>
                </div>

                <div className="button-group">
                    <button
                        className="btn btn-secondary download-btn"
                        onClick={downloadPDF}
                        disabled={salaryData.length === 0}
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                    {viewTab === 'current' && (
                        <button
                            className="btn btn-primary reset-btn"
                            onClick={() => setShowResetModal(true)}
                        >
                            <RefreshCw size={18} />
                            Start New Cycle
                        </button>
                    )}
                </div>
            </div>

            <div className="salary-table-container table-container glass-effect">
                {error && <div className="error-banner"><AlertTriangle size={18} /> {error}</div>}
                <table>
                    <thead>
                        <tr>
                            <th>Worker Name</th>
                            <th>Wage/Day</th>
                            <th>Present</th>
                            <th>Half-Day</th>
                            <th>1.5 Day</th>
                            <th>Absent</th>
                            <th>Total Salary</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading report...</td></tr>
                        ) : viewTab === 'history' && !selectedPayout ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <Calendar size={48} opacity={0.2} />
                                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Please select a past payout date to view history</p>
                                </div>
                            </td></tr>
                        ) : salaryData.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No records found for this period</td></tr>
                        ) : (
                            salaryData.map((worker, idx) => (
                                <React.Fragment key={idx}>
                                    <tr>
                                        <td>
                                            <div className="worker-info-cell">
                                                <span className="name">{worker.name}</span>
                                                <span className="spec">{worker.specialization}</span>
                                            </div>
                                        </td>
                                        <td>₹{worker.dailyWage}</td>
                                        <td><span className="count present">{worker.presentDays}</span></td>
                                        <td><span className="count half">{worker.halfDays}</span></td>
                                        <td><span className="count one-half">{worker.oneHalfDays || 0}</span></td>
                                        <td><span className="count absent">{worker.absentDays}</span></td>
                                        <td className="total-cell">₹{worker.totalSalary.toLocaleString('en-IN')}</td>
                                        <td>
                                            <button
                                                className="btn-expand"
                                                onClick={() => setExpandedWorker(expandedWorker === idx ? null : idx)}
                                            >
                                                {expandedWorker === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedWorker === idx && (
                                        <tr className="expanded-row">
                                            <td colSpan="7">
                                                <div className="attendance-details-grid">
                                                    <h5>Date-wise Attendance & Salary</h5>
                                                    <div className="details-list">
                                                        {worker.attendanceDetails.sort((a, b) => new Date(a.date) - new Date(b.date)).map((detail, dIdx) => (
                                                            <div key={dIdx} className="detail-tag glass-effect">
                                                                <span className="date">{formatDate(detail.date)}</span>
                                                                <span className={`status ${detail.status.toLowerCase()}`}>{detail.status}</span>
                                                                <span className="earned">
                                                                    ₹{detail.status === 'One-and-half' ? worker.dailyWage * 1.5 : (detail.status === 'Present' ? worker.dailyWage : detail.status === 'Half-day' ? worker.dailyWage / 2 : 0)}
                                                                </span>
                                                                <button
                                                                    className="btn-delete-detail"
                                                                    onClick={() => handleDeleteAttendance(worker.workerId || worker._id, detail.date)}
                                                                    title="Remove this marking"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reset Modal */}
            {showResetModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-effect reset-modal">
                        <div className="modal-header">
                            <h3><RefreshCw size={24} /> New Salary Cycle</h3>
                            <button onClick={() => setShowResetModal(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleReset}>
                            <p>This will mark all current records as **Paid** and start a new period.</p>
                            <p className="warning">Enter your admin password to confirm:</p>
                            <input
                                type="password"
                                placeholder="Admin Password"
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                                required
                                className="password-input"
                            />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowResetModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={resetLoading}>
                                    {resetLoading ? 'Resetting...' : 'Confirm & Start New'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .reports-controls { display: flex; gap: 2rem; padding: 1.5rem 2rem; border-radius: 0 0 20px 20px; margin-bottom: 2rem; align-items: flex-end; position: relative; border-top: none; }
        .reports-tabs { display: flex; gap: 5px; background: rgba(0,0,0,0.03); padding: 5px; border-radius: 15px 15px 0 0; width: fit-content; margin-bottom: -1px; }
        .tab-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: none; cursor: pointer; border-radius: 10px; font-weight: 700; color: #888; transition: all 0.2s; }
        .tab-btn.active { background: white; color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .control-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .control-group label { font-size: 0.8rem; font-weight: 700; color: #888; text-transform: uppercase; }
        .control-group select { padding: 0.8rem; border-radius: 10px; border: 1px solid #eee; background: white; min-width: 150px; }
        
        .download-btn { height: 48px; background: var(--primary); color: white; border: none; }
        .reset-btn { height: 48px; background: #33d391; color: white; border: none; }
        .button-group { display: flex; gap: 10px; }
        
        .download-btn:hover { background: #333; transform: translateY(-2px); }
        .reset-btn:hover { background: #28b479; transform: translateY(-2px); }
        .download-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
        .error-banner { background: #fff1f0; color: #ff4d4f; padding: 12px 20px; border-radius: 12px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; border: 1px solid #ffa39e; font-weight: 600; }

        .summary-payout { margin-left: auto; text-align: right; margin-right: 1rem; }
        .summary-payout .label { display: block; font-size: 0.8rem; color: #888; font-weight: 700; text-transform: uppercase; }
        .summary-payout .value { font-size: 1.8rem; font-weight: 900; color: #33d391; }

        .salary-table-container { padding: 1rem; border-radius: 24px; }
        .worker-info-cell { display: flex; flex-direction: column; }
        .worker-info-cell .name { font-weight: 700; color: #333; }
        .worker-info-cell .spec { font-size: 0.75rem; color: #888; text-transform: uppercase; }
        
        .count { padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
        .count.present { background: rgba(51, 211, 145, 0.1); color: #33d391; }
        .count.half { background: rgba(255, 180, 0, 0.1); color: #ffb400; }
        .count.one-half { background: rgba(142, 68, 173, 0.1); color: #8e44ad; }
        .count.absent { background: rgba(255, 77, 79, 0.1); color: #ff4d4f; }
        
        .total-cell { font-weight: 800; color: var(--primary); font-size: 1.05rem; }
        .btn-expand { background: none; border: 1px solid #eee; border-radius: 8px; padding: 5px; cursor: pointer; color: #888; transition: all 0.2s; }
        .btn-expand:hover { border-color: var(--accent); color: var(--accent); background: #fdfdfd; }

        .expanded-row { background: #fafafa; }
        .attendance-details-grid { padding: 1.5rem 2rem; border-radius: 15px; }
        .attendance-details-grid h5 { margin-bottom: 1rem; color: #666; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
        .details-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .detail-tag { display: flex; gap: 10px; align-items: center; padding: 8px 15px; border-radius: 10px; background: white; border: 1px solid #eee; font-size: 0.85rem; }
        .detail-tag .date { font-weight: 700; color: #333; }
        .detail-tag .status { padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .detail-tag .status.present { background: #33d391; color: white; }
        .detail-tag .status.half-day { background: #ffb400; color: white; }
        .detail-tag .status.absent { background: #ff4d4f; color: white; }
        .detail-tag .earned { font-weight: 700; color: #33d391; }

        .btn-delete-detail { background: none; border: none; color: #ff4d4f; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; transition: background 0.2s; margin-left: 8px; }
        .btn-delete-detail:hover { background: rgba(255, 77, 79, 0.1); }

        .reset-modal { max-width: 450px !important; }
        .warning { color: #ff4d4f; font-weight: 700; margin: 15px 0 5px; }
        .password-input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd; margin-bottom: 20px; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2000; animation: fadeIn 0.3s; }
        .modal-content { background: white; padding: 2.5rem; border-radius: 28px; width: 90%; max-width: 600px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
        .close-btn { background: none; border: none; cursor: pointer; color: #888; }
      `}} />
        </div>
    );
};

export default Reports;
