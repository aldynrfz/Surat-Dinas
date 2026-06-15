import React from 'react';
import { useNavigate } from 'react-router-dom';

const AchievementLetter = () => {
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
                        Surat Dinas
                    </button>
                    <span className="text-text-secondary text-sm font-medium">/</span>
                    <span className="text-white text-sm font-medium">Keterangan Berprestasi</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">Surat Keterangan Berprestasi</h1>
                    <p className="text-text-secondary text-base font-normal">Buat surat keterangan prestasi akademik siswa berdasarkan peringkat dan nilai semester.</p>
                </div>

                {/* Search Section */}
                <div className="glass-panel p-6 rounded-2xl">
                    <label className="flex flex-col gap-3">
                        <span className="text-white font-semibold text-sm ml-1">Cari Data Siswa (Auto-fill)</span>
                        <div className="flex w-full items-stretch rounded-xl h-12 bg-surface-dark focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                            <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="w-full bg-transparent border-none text-white placeholder:text-text-secondary/50 focus:ring-0 text-base h-full px-2"
                                placeholder="Ketik nama siswa atau NIS/NISN..."
                            />
                            <div className="pr-2 flex items-center">
                                <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-colors">
                                    CARI
                                </button>
                            </div>
                        </div>
                    </label>
                    <div className="mt-3 flex items-start gap-2 text-xs text-text-secondary px-1">
                        <span className="material-symbols-outlined text-base">info</span>
                        <p>Data siswa dan nilai akan otomatis terisi jika tersedia di database akademik.</p>
                    </div>
                </div>

                <form className="flex flex-col gap-8 pb-12">
                    {/* Administrasi Surat */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Administrasi Surat</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nomor Surat</label>
                                <div className="relative">
                                    <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: 422.5/102/MTs-PP/VI/2024" type="text" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none text-[20px]">tag</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Siswa */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Data Siswa</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Lengkap Siswa</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Siti Nurhaliza" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIS</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Nomor Induk Siswa" type="number" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NISN</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Nomor Induk Siswa Nasional" type="number" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tempat Lahir</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Surabaya" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Lahir</label>
                                <div className="relative">
                                    <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all appearance-none" type="date" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">calendar_today</span>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Alamat Lengkap</label>
                                <textarea className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 min-h-[100px] p-4 resize-none transition-all" placeholder="Jl. Pendidikan No. 1..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Data Prestasi Akademik */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">military_tech</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Data Prestasi Akademik</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="rounded-xl border border-border-dark overflow-hidden">
                                <div className="grid grid-cols-12 bg-surface-dark p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                    <div className="col-span-4 md:col-span-4">Kelas / Semester</div>
                                    <div className="col-span-4 md:col-span-4 text-center">Peringkat Ke-</div>
                                    <div className="col-span-4 md:col-span-4 text-center">Jumlah Nilai</div>
                                </div>
                                {/* Rows */}
                                {[
                                    { grade: 'Kelas VII (Tujuh)', sem: 'Semester 1 (Ganjil)' },
                                    { grade: 'Kelas VII (Tujuh)', sem: 'Semester 2 (Genap)' },
                                    { grade: 'Kelas VIII (Delapan)', sem: 'Semester 1 (Ganjil)' },
                                    { grade: 'Kelas VIII (Delapan)', sem: 'Semester 2 (Genap)' },
                                    { grade: 'Kelas IX (Sembilan)', sem: 'Semester 1 (Ganjil)' },
                                    { grade: 'Kelas IX (Sembilan)', sem: 'Semester 2 (Genap)' },
                                ].map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 p-4 items-center border-b border-border-dark hover:bg-white/5 transition-colors last:border-b-0">
                                        <div className="col-span-4 md:col-span-4">
                                            <span className="text-white font-medium block">{item.grade}</span>
                                            <span className="text-text-secondary text-sm">{item.sem}</span>
                                        </div>
                                        <div className="col-span-4 md:col-span-4 px-2">
                                            <input className="w-full bg-background-dark text-white text-center rounded-lg border border-border-dark focus:border-primary focus:ring-0 h-10 transition-all" placeholder="0" type="number" />
                                        </div>
                                        <div className="col-span-4 md:col-span-4 px-2">
                                            <input className="w-full bg-background-dark text-white text-center rounded-lg border border-border-dark focus:border-primary focus:ring-0 h-10 transition-all" placeholder="0.00" step="0.01" type="number" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Penandatanganan */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">ink_pen</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Penandatanganan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tempat Surat</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Yogyakarta" type="text" defaultValue="Yogyakarta" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Surat</label>
                                <div className="relative">
                                    <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all appearance-none" type="date" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">event</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Kepala Madrasah</label>
                                <div className="relative">
                                    <select className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all appearance-none cursor-pointer">
                                        <option disabled value="">Pilih Pejabat</option>
                                        <option selected value="1">Drs. H. Ahmad Dahlan, M.Pd.</option>
                                        <option value="2">Hj. Siti Aisyah, S.Ag.</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIP Kepala Madrasah</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 bg-opacity-50" readOnly type="text" defaultValue="19780502 200501 1 012" />
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

export default AchievementLetter;
