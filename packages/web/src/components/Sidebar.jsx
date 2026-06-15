import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../contexts/LayoutContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isSidebarCollapsed, isMobileSidebarOpen, closeMobileSidebar } = useLayout();

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout', error);
        }
    };

    const menuItems = [
        {
            section: 'Main Menu', items: [
                { name: 'Dashboard', icon: 'dashboard', path: '/' },
                { name: 'Layanan Surat', icon: 'mark_email_unread', path: '/layanan-surat' },
                { name: 'Riwayat Surat', icon: 'history', path: '/riwayat-surat' },
                { name: 'Agenda Surat', icon: 'menu_book', path: '/agenda-surat' }
            ]
        },
        {
            section: 'Administrasi', items: [
                { name: 'Data Siswa', icon: 'groups', path: '/data-siswa' },
                { name: 'Pegawai', icon: 'badge', path: '/pegawai' },
                { name: 'Rombongan Belajar', icon: 'class', path: '/rombel' },
                { name: 'Keuangan', icon: 'payments', path: '/keuangan' }
            ]
        },
        {
            section: 'System', items: [
                { name: 'Pengaturan', icon: 'settings', path: '/pengaturan' }
            ]
        }
    ];

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-30 flex flex-col h-full border-r border-[#272546] glass-sidebar transition-all duration-300
                ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isSidebarCollapsed ? 'md:w-20' : 'md:w-[260px]'}
                w-[260px]
            `}
        >
            <div className="flex flex-col h-full">
                {/* App Logo */}
                <div className={`
                    p-6 border-b border-[#272546] flex items-center justify-center transition-all duration-300
                    ${isSidebarCollapsed ? 'p-4' : 'p-6'}
                `}>
                    <img
                        src="/images/app-logo.png"
                        alt="App Logo"
                        className={`transition-all duration-300 ${isSidebarCollapsed ? 'h-8 w-auto' : 'h-12 w-auto'}`}
                    />
                </div>

                {/* Navigation Links */}
                <div className={`flex flex-col gap-1 flex-1 overflow-y-auto ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                    {menuItems.map((section, idx) => (
                        <div key={idx} className={isSidebarCollapsed ? 'mb-2' : ''}>
                            {!isSidebarCollapsed && (
                                <p className="px-3 text-xs font-semibold text-[#686687] uppercase tracking-wider mb-2 mt-2 truncate">
                                    {section.section}
                                </p>
                            )}
                            {isSidebarCollapsed && idx > 0 && <div className="my-2 border-t border-[#272546] mx-2" />}

                            {section.items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => closeMobileSidebar()}
                                    title={isSidebarCollapsed ? item.name : ''}
                                    className={`
                                        flex items-center gap-3 rounded-xl group transition-all
                                        ${isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
                                        ${isActive(item.path)
                                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                                            : 'text-[#9795c6] hover:bg-[#272546] hover:text-white transition-colors'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined ${!isActive(item.path) && 'group-hover:text-white transition-colors'
                                        }`}>
                                        {item.icon}
                                    </span>
                                    {!isSidebarCollapsed && (
                                        <span className="text-sm font-medium truncate">{item.name}</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className={`mt-auto border-t border-[#272546] transition-all duration-300 ${isSidebarCollapsed ? 'p-3' : 'px-4 py-3'}`}>
                    {!isSidebarCollapsed ? (
                        <div className="flex flex-col items-center gap-0.5 text-center">
                            <p className="text-white text-xs font-black tracking-wide">
                                SERAT DINES <span className="text-[9px] font-semibold align-super">1.0</span>
                            </p>
                            <p className="text-[#686687] text-[10px] leading-tight">
                                Copyright &copy; {new Date().getFullYear()}. All rights reserved.
                            </p>
                        </div>
                    ) : (
                        <div className="flex justify-center" title="SERAT DINES 1.0">
                            <span className="text-[#686687] text-[9px] font-bold">SD 1.0</span>
                        </div>
                    )}
                </div>

            </div>
        </aside>
    );
};

export default Sidebar;
