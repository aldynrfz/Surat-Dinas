import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    Settings,
    HelpCircle,
    FileText,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

const UserProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const auth = getAuth();
    const user = auth.currentUser;

    const toggleDropdown = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const menuItems = [
        { icon: User, label: 'Profil', path: '/profile-user' },
        { icon: HelpCircle, label: 'Pusat Bantuan', path: '/help-center' },
        { icon: FileText, label: 'Panduan', path: '/help-center' }, // Consolidated for now or new route if needed
        { icon: Settings, label: 'Pengaturan Akun', path: '/settings-account' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-3 p-1.5 rounded-full hover:bg-[#272546] transition-all group outline-none"
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#1c1b2e] flex items-center justify-center overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-sm">
                                {user?.email ? user.email.substring(0, 2).toUpperCase() : 'US'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="hidden md:flex flex-col items-start mr-1">
                    <span className="text-white text-sm font-semibold leading-tight">
                        {user?.displayName || 'Admin User'}
                    </span>
                    <span className="text-[#9795c6] text-xs">Administrator</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#9795c6] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute top-full right-0 mt-2 w-64 bg-[#1c1b2e] rounded-xl border border-[#272546] shadow-2xl overflow-hidden transition-all duration-200 origin-top-right z-[9999] transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-2 pointer-events-none'}`}>

                <div className="p-4 border-b border-[#272546] bg-[#131221]">
                    <p className="text-white font-bold truncate">{user?.displayName || 'Admin User'}</p>
                    <p className="text-[#9795c6] text-xs truncate">{user?.email}</p>
                </div>

                <div className="p-2 space-y-1">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9795c6] hover:text-white hover:bg-[#272546] transition-colors group"
                        >
                            <item.icon className="w-4 h-4 text-[#9795c6] group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1 group"
                    >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileDropdown;
