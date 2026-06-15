import React from 'react';
import { useNavigate } from 'react-router-dom';

const LetterService = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-y-auto z-10 p-6 md:p-10 scroll-smooth">
            <div className="max-w-6xl mx-auto flex flex-col gap-10">

                {/* Page Heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-dark/50">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-black text-white tracking-tight">Pusat Layanan Surat</h2>
                        <p className="text-text-secondary text-lg max-w-2xl">Pilih jenis surat yang ingin Anda buat dari kategori di bawah ini. Semua surat akan tersimpan otomatis di draft.</p>
                    </div>
                    <button
                        onClick={() => navigate('/riwayat-surat')}
                        className="flex items-center gap-2 bg-white text-background-dark hover:bg-slate-200 px-5 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-white/5"
                    >
                        <span className="material-symbols-outlined">history</span>
                        <span>Riwayat Surat</span>
                    </button>
                </div>

                {/* Section 1: Layanan Kesiswaan */}
                <section className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Layanan Kesiswaan</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                        {/* Surat Keterangan Aktif */}
                        <div
                            onClick={() => navigate('/layanan-surat/keterangan-aktif')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">badge</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-primary -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Keterangan Aktif</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Keterangan status siswa aktif untuk keperluan beasiswa atau lomba.</p>
                            </div>
                        </div>

                        {/* Surat Mutasi Keluar */}
                        <div
                            onClick={() => navigate('/layanan-surat/mutasi-keluar')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">logout</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-orange-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Mutasi Keluar</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Pengajuan pindah sekolah siswa ke institusi pendidikan lain.</p>
                            </div>
                        </div>

                        {/* Surat Mutasi Masuk */}
                        <div
                            onClick={() => navigate('/layanan-surat/mutasi-masuk')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">login</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-emerald-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Mutasi Masuk</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Administrasi penerimaan siswa pindahan dari sekolah lain.</p>
                            </div>
                        </div>

                        {/* Surat Rekomendasi */}
                        <div
                            onClick={() => navigate('/layanan-surat/rekomendasi')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">recommend</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-purple-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Rekomendasi</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Rekomendasi resmi sekolah untuk keperluan studi lanjut atau beasiswa.</p>
                            </div>
                        </div>

                        {/* Surat Panggilan Orang Tua */}
                        <div
                            onClick={() => navigate('/layanan-surat/panggilan-orang-tua')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">notification_important</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-red-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Panggilan Orang Tua</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Undangan resmi kepada wali murid untuk diskusi perkembangan siswa.</p>
                            </div>
                        </div>

                        {/* SK Berkelakuan Baik */}
                        <div
                            onClick={() => navigate('/layanan-surat/keterangan-baik')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">verified_user</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-teal-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Keterangan Berkelakuan Baik</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Dokumen pernyataan perilaku baik siswa selama masa studi.</p>
                            </div>
                        </div>

                        {/* Surat Keterangan Berprestasi */}
                        <div
                            onClick={() => navigate('/layanan-surat/keterangan-berprestasi')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">emoji_events</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-amber-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Keterangan Berprestasi</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Apresiasi tertulis atas pencapaian akademik atau non-akademik siswa.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Layanan Kepegawaian */}
                <section className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Layanan Kepegawaian</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Surat Tugas */}
                        <div
                            onClick={() => navigate('/layanan-surat/surat-tugas')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">assignment_ind</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-primary -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Tugas</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Pembuatan surat tugas dinas luar atau kegiatan sekolah.</p>
                            </div>
                        </div>

                        {/* Pengajuan Cuti */}
                        <div
                            onClick={() => navigate('/layanan-surat/pengajuan-cuti')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">beach_access</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-pink-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Pengajuan Cuti</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Formulir pengajuan cuti tahunan, sakit, atau alasan penting.</p>
                            </div>
                        </div>

                        {/* SPPD */}
                        <div
                            onClick={() => navigate('/layanan-surat/sppd')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">commute</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-cyan-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Perintah Perjalanan Dinas (SPPD)</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Dokumen perintah dan anggaran untuk perjalanan dinas pegawai.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Layanan Umum */}
                <section className="flex flex-col gap-5 pb-10">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-gradient-to-b from-sky-400 to-indigo-500 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Layanan Umum</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                        {/* Surat Keterangan Penelitian */}
                        <div
                            onClick={() => navigate('/layanan-surat/keterangan-penelitian')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-sky-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">science</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-sky-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Keterangan Penelitian</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Izin pelaksanaan penelitian atau pengambilan data di lingkungan sekolah.</p>
                            </div>
                        </div>

                        {/* Surat Izin Kuliah */}
                        <div
                            onClick={() => navigate('/layanan-surat/izin-kuliah')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">school</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-violet-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Surat Izin Kuliah</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Surat izin bagi pegawai untuk melanjutkan pendidikan ke jenjang lebih tinggi.</p>
                            </div>
                        </div>

                        {/* Izin Pinjam BMN */}
                        <div
                            onClick={() => navigate('/layanan-surat/izin-pinjam-bmn')}
                            className="glass-card group p-6 rounded-2xl border border-border-dark hover:border-lime-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-500/10 cursor-pointer flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="size-14 rounded-2xl bg-lime-500/10 flex items-center justify-center text-lime-400 group-hover:bg-lime-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">inventory_2</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-lime-500 -rotate-45 group-hover:rotate-0 transition-all duration-300">arrow_forward</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Izin Pinjam BMN</h4>
                                <p className="text-sm text-text-secondary line-clamp-2">Surat izin pemakaian Barang Milik Negara untuk keperluan dinas pegawai.</p>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </div>
    );
};

export default LetterService;
