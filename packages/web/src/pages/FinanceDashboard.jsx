import React from 'react';
import { useNavigate } from 'react-router-dom';

const FinanceDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-y-auto z-10 p-6 md:p-10 scroll-smooth">
            <div className="max-w-6xl mx-auto flex flex-col gap-10">

                {/* Page Heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-dark/50 animate-fade-in">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-black text-white tracking-tight">Manajemen Keuangan & Aset</h2>
                        <p className="text-text-secondary text-lg max-w-2xl">Kelola data keuangan dan aset barang milik negara dengan mudah dan terintegrasi.</p>
                    </div>
                </div>

                {/* Section Aset */}
                <section className="flex flex-col gap-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Manajemen Aset</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* BMN Card */}
                        <div
                            onClick={() => navigate('/keuangan/bmn')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">inventory_2</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-indigo-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Barang Milik Negara</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Kelola daftar aset dan barang milik negara, elektronik, dan peralatan.</p>
                            </div>
                        </div>

                        {/* BMN Buku Perpus Card */}
                        <div
                            onClick={() => navigate('/keuangan/perpus')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">library_books</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-blue-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Buku Perpus</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Manajemen inventaris buku perpustakaan, pencatatan pinjaman, dan stok.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section Keuangan */}
                <section className="flex flex-col gap-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-gradient-to-b from-slate-500 to-slate-400 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Manajemen Keuangan</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Placeholder Kas & Anggaran */}
                        <div className="glass-card p-6 rounded-2xl border border-border-dark opacity-50 cursor-not-allowed flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Kas & Anggaran</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Fitur pengelolaan kas dan anggaran madrasah (Segera Hadir).</p>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default FinanceDashboard;
