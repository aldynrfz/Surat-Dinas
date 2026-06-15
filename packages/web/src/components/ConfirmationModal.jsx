import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', isLoading = false }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const colors = {
        danger: {
            icon: 'text-red-500 bg-red-500/10',
            button: 'bg-red-500 hover:bg-red-600',
        },
        warning: {
            icon: 'text-yellow-500 bg-yellow-500/10',
            button: 'bg-yellow-500 hover:bg-yellow-600',
        },
        info: {
            icon: 'text-blue-500 bg-blue-500/10',
            button: 'bg-blue-500 hover:bg-blue-600',
        }
    };

    const style = colors[type] || colors.info;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1c1b2e] border border-[#272546] rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${style.icon}`}>
                        <span className="material-symbols-outlined text-[24px]">
                            {type === 'danger' ? 'delete' : 'warning'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <p className="text-[#9795c6] text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="flex gap-3 w-full mt-2">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-[#272546] text-[#9795c6] hover:bg-[#272546] hover:text-white transition-colors font-medium text-sm disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-white shadow-lg transition-all font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 ${style.button}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <span>Ya, Lanjutkan</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
