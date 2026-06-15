import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResearchLetter = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-y-auto z-10 p-6 md:p-10 scroll-smooth">
            <div className="max-w-[960px] mx-auto flex flex-col gap-8">

                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 px-1">
                    <button
                        onClick={() => navigate('/')}
                        className="text-text-secondary text-sm font-medium hover:text-primary transition-colors"
                    >
                        Dashboard
                    </button>
                    <span className="text-text-secondary text-sm font-medium">/</span>
                    <button
                        onClick={() => navigate('/layanan-surat')}
                        className="text-text-secondary text-sm font-medium hover:text-primary transition-colors"
                    >
                        Layanan Surat
                    </button>
                    <span className="text-text-secondary text-sm font-medium">/</span>
                    <span className="text-white text-sm font-medium">Keterangan Penelitian</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">Formulir Surat Keterangan Penelitian</h1>
                    <p className="text-text-secondary text-base font-normal">Buat surat keterangan untuk mahasiswa yang telah selesai melaksanakan penelitian skripsi/tesis.</p>
                </div>

                <form className="flex flex-col gap-8 pb-12">
                    {/* Informasi Surat */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Informasi Surat</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nomor Surat</label>
                                <div className="relative">
                                    <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: 423.4/015/MTs-AN/IX/2024" type="text" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none text-[20px]">tag</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Mahasiswa Peneliti */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Data Mahasiswa Peneliti</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Lengkap</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Siti Aisyah" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIM (Nomor Induk Mahasiswa)</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: 180102045" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Program Studi / Jurusan</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Pendidikan Bahasa Arab" type="text" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Alamat Lengkap</label>
                                <textarea className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 min-h-[100px] p-4 resize-none transition-all" placeholder="Alamat sesuai KTP atau domisili mahasiswa..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Detail Penelitian */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">science</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Detail Penelitian</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Judul Skripsi / Penelitian</label>
                                <textarea className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 min-h-[120px] p-4 resize-none transition-all" placeholder="Tuliskan judul lengkap skripsi..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Pengesahan */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">ink_pen</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Pengesahan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tempat Surat (Kota/Kabupaten)</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Bandung" type="text" defaultValue="Bandung" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Surat</label>
                                <div className="relative">
                                    <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all appearance-none" type="date" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">calendar_today</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Kepala Madrasah</label>
                                <div className="relative">
                                    <select className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all appearance-none cursor-pointer">
                                        <option disabled value="">Pilih Pejabat</option>
                                        <option selected value="1">Drs. H. Muhammad Ilham, M.Pd.</option>
                                        <option value="2">Hj. Siti Aminah, S.Ag.</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIP Kepala Madrasah</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 bg-opacity-50" readOnly type="text" defaultValue="19750502 200501 1 008" />
                            </div>
                        </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/layanan-surat')}
                            className="h-12 px-8 rounded-xl border border-border-dark text-text-secondary font-bold hover:text-white hover:bg-surface-dark transition-all"
                        >
                            Batalkan
                        </button>
                        <button
                            type="submit"
                            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[20px]">print</span>
                            Generate Surat
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResearchLetter;
