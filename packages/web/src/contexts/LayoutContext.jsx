import React, { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext({});

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within LayoutProvider');
    }
    return context;
};

export const LayoutProvider = ({ children }) => {
    // Desktop: default expanded (false), Mobile: default closed (false)
    // For desktop collapsed state, we'll use isSidebarCollapsed
    // For mobile drawer state, we'll use isMobileSidebarOpen

    // Check local storage for persisted state or default to false (expanded)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const savedState = localStorage.getItem('sidebarCollapsed');
        return savedState === 'true';
    });

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
    }, [isSidebarCollapsed]);

    // Close mobile sidebar on route change (optional but good UX)
    // We can't access location here easily without routing context, 
    // so we'll let the Sidebar component handle closing on navigation if needed,
    // or just expose the setter.

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => !prev);
    };

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(prev => !prev);
    };

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    const value = {
        isSidebarCollapsed,
        isMobileSidebarOpen,
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar
    };

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
};
