import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColors = {
        success: 'bg-green-500/10 border-green-500/20 text-green-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    };

    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
        warning: 'warning',
    };

    return (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-top-2 duration-300 ${bgColors[type] || bgColors.info}`}>
            <span className="material-symbols-outlined text-[20px]">{icons[type]}</span>
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
        </div>
    );
};

export default Toast;
