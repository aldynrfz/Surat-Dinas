import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudyPermitLetter = () => {
    const navigate = useNavigate();
    const [statusPegawai, setStatusPegawai] = useState('');
    const [jenjang, setJenjang] = useState('');

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
                    <span className="text-white text-sm font-medium">Izin Kuliah</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">Formulir Surat Izin Kuliah</h1>
                    <p className="text-text-secondary text-base font-normal">Buat dan kelola surat izin melanjutkan studi/kuliah bagi pegawai atau guru.</p>
                </div>

                {/* Search Section */}
                <div className="glass-panel p-6 rounded-2xl">
                    <label className="flex flex-col gap-3">
                        <span className="text-white font-semibold text-sm ml-1">Cari Data Pegawai (Auto-fill)</span>
                        <div className="flex w-full items-stretch rounded-xl h-12 bg-surface-dark focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                            <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="w-full bg-transparent border-none text-white placeholder:text-text-secondary/50 focus:ring-0 text-base h-full px-2"
                                placeholder="Ketik nama pegawai atau NIP..."
                            />
                            <div className="pr-2 flex items-center">
                                <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-colors">
                                    CARI
                                </button>
                            </div>
                        </div>
                    </label>
                    <div className="mt-3 flex items-start gap-2 text-xs text-text-secondary px-1">
                        <span className="material-symbols-outlined text-base text-primary">info</span>
                        <p>Data pegawai akan terisi otomatis jika ditemukan dalam database kepegawaian.</p>
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
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nomor Surat</label>
                                <div className="relative">
                                    <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: B-123/Ma.10.12/KP.01.2/08/2024" type="text" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none text-[20px]">tag</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Lampiran</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: 1 (Satu) Berkas" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Perihal</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all" type="text" defaultValue="Permohonan Izin Kuliah" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Kepada Yth.</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Kepala Kantor Kemenag..." type="text" />
                            </div>
                        </div>
                    </div>

                    {/* Identitas Pegawai */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">badge</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Identitas Pegawai</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Lengkap Pegawai</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Nama otomatis terisi..." type="text" />
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
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIP</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Nomor Induk Pegawai" type="number" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Jabatan</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Guru Madya / Staf TU" type="text" />
                            </div>
                        </div>
                    </div>

                    {/* Status Kepegawaian */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">category</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Status Kepegawaian</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-text-secondary text-sm font-medium ml-1">Pilih Kategori Pekerjaan</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: 'guru_pns', label: 'Guru PNS', icon: 'school', color: 'text-primary' },
                                    { id: 'guru_pppk', label: 'Guru PPPK', icon: 'history_edu', color: 'text-teal-400' },
                                    { id: 'staf_pns', label: 'Staf TU PNS', icon: 'admin_panel_settings', color: 'text-orange-400' },
                                    { id: 'staf_pppk', label: 'Staf TU PPPK', icon: 'badge', color: 'text-pink-400' }
                                ].map((item) => (
                                    <label key={item.id} className="cursor-pointer group relative">
                                        <input
                                            className="peer sr-only"
                                            name="status_pegawai"
                                            type="radio"
                                            value={item.id}
                                            checked={statusPegawai === item.id}
                                            onChange={() => setStatusPegawai(item.id)}
                                        />
                                        <div className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all h-32 group-hover:scale-[1.02] ${statusPegawai === item.id ? 'border-primary bg-primary/15 active-card-glow' : 'border-border-dark bg-surface-dark/30 hover:bg-surface-dark/60'}`}>
                                            <span className={`material-symbols-outlined text-3xl transition-colors ${statusPegawai === item.id ? item.color : 'text-text-secondary group-hover:text-primary'}`}>{item.icon}</span>
                                            <span className="text-white font-semibold text-center text-sm">{item.label}</span>
                                            <div className={`absolute top-2 right-2 transition-all bg-primary rounded-full p-0.5 text-white ${statusPegawai === item.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                                <span className="material-symbols-outlined text-xs">check</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Detail Pendidikan Lanjutan */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">menu_book</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Detail Pendidikan Lanjutan</h3>
                        </div>
                        <div className="space-y-4">
                            <label className="text-text-secondary text-sm font-medium ml-1">Jenjang Pendidikan</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { id: 's1', label: 'Sarjana (S1)', sub: 'Strata 1', icon: 'workspace_premium', color: 'text-blue-400', bg: 'bg-blue-500/20' },
                                    { id: 's2', label: 'Pascasarjana (S2)', sub: 'Magister', icon: 'school', color: 'text-primary', bg: 'bg-primary/20' },
                                    { id: 's3', label: 'Doktor (S3)', sub: 'Strata 3', icon: 'local_library', color: 'text-purple-400', bg: 'bg-purple-500/20' },
                                    { id: 'profesi', label: 'Profesi', sub: 'Pendidikan Profesi', icon: 'engineering', color: 'text-orange-400', bg: 'bg-orange-500/20' },
                                    { id: 'lainnya', label: 'Lainnya', sub: 'Ketik Sendiri', icon: 'auto_stories', color: 'text-text-secondary', bg: 'bg-surface-dark/50' }
                                ].map((item) => (
                                    <label key={item.id} className="cursor-pointer group relative">
                                        <input
                                            className="peer sr-only"
                                            name="jenjang"
                                            type="radio"
                                            value={item.id}
                                            checked={jenjang === item.id}
                                            onChange={() => setJenjang(item.id)}
                                        />
                                        <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all h-full text-center relative group-hover:scale-[1.02] ${jenjang === item.id ? 'border-primary bg-primary/15' : 'border-border-dark bg-surface-dark/30 hover:bg-surface-dark/60'}`}>
                                            <div className={`${item.bg} p-2 rounded-full ${item.color}`}>
                                                <span className="material-symbols-outlined">{item.icon}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-xs">{item.label}</span>
                                                <span className="text-text-secondary text-[10px]">{item.sub}</span>
                                            </div>
                                            <div className={`absolute top-2 right-2 transition-all text-primary ${jenjang === item.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {jenjang === 'lainnya' && (
                                <div className="mt-2 animate-fade-in">
                                    <label className="text-text-secondary text-sm font-medium ml-1">Sebutkan Jenjang Pendidikan</label>
                                    <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 mt-1 transition-all" placeholder="Misal: Spesialis, D4, dll..." type="text" />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Perguruan Tinggi</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Universitas Indonesia" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Fakultas / Jurusan</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Manajemen Pendidikan" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tahun Akademik</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: 2024/2025" type="text" />
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
                                <label className="text-text-secondary text-sm font-medium ml-1">Tempat Surat</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Kota/Kabupaten" type="text" defaultValue="Jakarta Selatan" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Surat</label>
                                <div className="relative">
                                    <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 appearance-none transition-all" type="date" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">event</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Kepala Madrasah</label>
                                <div className="relative">
                                    <select className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 appearance-none cursor-pointer transition-all">
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

export default StudyPermitLetter;
