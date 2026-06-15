import React from 'react';
import { useLocation } from 'react-router-dom';
import UserProfileDropdown from './UserProfileDropdown';
import { useSchool } from '../contexts/SchoolContext';
import { useLayout } from '../contexts/LayoutContext';
import { PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';

const Header = () => {
    const location = useLocation();
    const { schoolData, loading } = useSchool();
    const { toggleSidebar, toggleMobileSidebar, isSidebarCollapsed } = useLayout();

    return (
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-[#272546] px-6 py-4 flex items-center justify-between">
            {/* School Identity - EMIS Style */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileSidebar}
                    className="md:hidden text-white p-1 hover:bg-[#272546] rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Desktop Sidebar Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex text-[#9795c6] hover:text-white p-1 hover:bg-[#272546] rounded-lg transition-colors"
                    title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isSidebarCollapsed ? (
                        <PanelLeftOpen className="w-6 h-6" />
                    ) : (
                        <PanelLeftClose className="w-6 h-6" />
                    )}
                </button>

                {loading ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#272546] rounded-full animate-pulse"></div>
                        <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 bg-[#272546] rounded animate-pulse"></div>
                            <div className="h-3 w-24 bg-[#272546] rounded animate-pulse"></div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        {/* School Logo */}
                        {schoolData?.logo_url ? (
                            <img
                                src={schoolData.logo_url}
                                alt="School Logo"
                                className="w-10 h-10 rounded-full border-2 border-[#272546] object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-[#272546] flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                    {schoolData?.nama_madrasah?.substring(0, 2).toUpperCase() || 'SC'}
                                </span>
                            </div>
                        )}

                        {/* School Identity Text */}
                        <div className="flex flex-col">
                            <h2 className="text-white text-base md:text-lg font-bold tracking-tight leading-tight">
                                {schoolData?.nama_madrasah || 'School Name'}
                            </h2>
                            <p className="text-[#9795c6] text-xs">
                                NSM: {schoolData?.nsm || '-'}
                            </p>
                        </div>
                    </div>
                )}
            </div>


            {/* User Profile Dropdown */}
            <UserProfileDropdown />
        </header>
    );
};

export default Header;
