import React from 'react';
import {
    Users,
    MapPin,
    CalendarCheck,
    BarChart3,
    LogOut,
    Plus,
    Search,
    HardHat,
    FileText,
    Image as ImageIcon,
    Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';

// Import Admin Sub-components
import Overview from './admin/Overview';
import WorkersList from './admin/Workers';
import Sites from './admin/Sites';
import Attendance from './admin/Attendance';
import Reports from './admin/Reports';
import GalleryManager from './admin/GalleryManager';
import Leads from './admin/Leads';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/admin-login');
    };

    const sidebarItems = [
        { name: 'Overview', path: '/admin', icon: <BarChart3 size={20} /> },
        { name: 'Workers', path: '/admin/workers', icon: <Users size={20} /> },
        { name: 'Sites', path: '/admin/sites', icon: <MapPin size={20} /> },
        { name: 'Attendance', path: '/admin/attendance', icon: <CalendarCheck size={20} /> },
        { name: 'Leads', path: '/admin/leads', icon: <Mail size={20} /> },
        { name: 'Salary Reports', path: '/admin/reports', icon: <FileText size={20} /> },
        { name: 'Gallery', path: '/admin/gallery', icon: <ImageIcon size={20} /> },
    ];

    const currentTitle = sidebarItems.find(i => i.path === location.pathname)?.name || 'Dashboard';

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar glass-effect">
                <div className="sidebar-header">
                    <HardHat size={30} className="sidebar-logo" />
                    <span>Admin Panel</span>
                </div>

                <nav className="sidebar-nav">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{user?.name?.charAt(0)}</div>
                        <div className="user-meta">
                            <p className="user-name">{user?.name}</p>
                            <p className="user-role">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="dashboard-content">
                <header className="content-header">
                    <h2>{currentTitle}</h2>
                    <button onClick={handleLogout} className="header-logout">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </header>

                <div className="view-container">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/workers" element={<WorkersList />} />
                        <Route path="/sites" element={<Sites />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/leads" element={<Leads />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/gallery" element={<GalleryManager />} />
                    </Routes>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .dashboard-layout { display: flex; min-height: 100vh; background: #f0f2f5; }
        
        .sidebar {
          width: 280px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          background: #fff;
          z-index: 1100;
          box-shadow: 4px 0 15px rgba(0,0,0,0.05);
          overflow-y: auto;
        }
        .sidebar-header { display: flex; align-items: center; gap: 12px; margin-bottom: 3rem; padding: 0 1rem; font-weight: 800; font-size: 1.2rem; flex-shrink: 0; }
        .sidebar-logo { color: var(--accent); }
        
        .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem 1.2rem;
          text-decoration: none;
          color: var(--text-light);
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-item:hover { background: #f8f9fa; color: var(--primary); }
        .nav-item.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        .sidebar-footer { padding-top: 1rem; border-top: 1px solid #eee; margin-top: auto; flex-shrink: 0; }
        .user-info { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; padding: 0 0.5rem; }
        .user-avatar { width: 40px; height: 40px; background: var(--accent); color: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .user-meta { display: flex; flex-direction: column; overflow: hidden; }
        .user-name { font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .logout-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 0.8rem; border-radius: 10px; border: 1px solid #eee; background: none; cursor: pointer; color: #ff4d4f; font-weight: 600; transition: background 0.2s; }
        .logout-btn:hover { background: #fff1f0; }

        .dashboard-content { flex: 1; margin-left: 280px; padding: 2rem 3rem; }
        .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
        .content-header h2 { font-size: 1.8rem; font-weight: 800; }
        
        .header-actions { display: flex; gap: 1.5rem; align-items: center; }
        .header-logout { display: flex; align-items: center; gap: 8px; padding: 0.6rem 1.2rem; border-radius: 8px; border: 1px solid #ff4d4f; background: white; color: #ff4d4f; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .header-logout:hover { background: #ff4d4f; color: white; }

        .search-box { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 16px; color: #aaa; }
        .search-box input { padding: 0.7rem 1rem 0.7rem 2.8rem; border-radius: 10px; border: 1px solid #eee; width: 250px; }

        .view-container { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 900px) {
          .sidebar { width: 80px; padding: 1rem 0.5rem; align-items: center; }
          .sidebar-header span, .nav-item span, .user-meta, .logout-btn span { display: none; }
          .dashboard-content { margin-left: 80px; padding: 1.5rem; }
          .sidebar-nav { width: 100%; }
          .nav-item { justify-content: center; padding: 1rem; }
          .header-logout span { display: none; }
          .header-logout { padding: 0.6rem; }
        }
      `}} />
        </div>
    );
};

export default Dashboard;
