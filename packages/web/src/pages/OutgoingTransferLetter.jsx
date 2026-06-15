import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OutgoingTransferLetter = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Data Lembar 1
        nama_orangtua: '',
        pekerjaan_orangtua: '',
        alamat_orangtua: '',
        nama_siswa: '',
        nis: '',
        nisn: '',
        jenis_kelamin: '', // 'L' atau 'P'
        kelas: '',
        sekolah_tujuan: '',
        alasan_pindah: '',

        // Data Lembar 2 & 3
        nomor_surat: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        sekolah_asal: 'MTsN 11 Tasikmalaya', // Default sekolah asal
        agama: '',
        tanggal_diterima: '',
        tanggal_keluar: '',

        // Data Metadata Surat
        tempat_surat: 'Tasikmalaya',
        tanggal_surat: new Date().toISOString().split('T')[0] // Default tanggal hari ini
    });

    // Fungsi untuk menangani perubahan input secara otomatis
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Fungsi Auto-fill (Placeholder untuk integrasi database nanti)
    const handleSearchSiswa = () => {
        // Nanti di sini kita panggil data dari Firebase/Database
        console.log("Mencari data siswa...");
    };

    // Fungsi untuk menangani saat tombol "Generate" diklik
    const handleSubmit = (e) => {
        e.preventDefault(); // Mencegah halaman reload

        // Validasi sederhana: Pastikan data penting sudah diisi
        if (!formData.nama_siswa || !formData.sekolah_tujuan) {
            alert("Mohon lengkapi Nama Siswa dan Sekolah Tujuan terlebih dahulu!");
            return;
        }

        // Di sini nantinya kamu tambahkan logika untuk SAVE ke Firebase/Database
        console.log("Data Mutasi yang akan disimpan:", formData);

        // Setelah disave, arahkan user ke Riwayat Surat sambil membawa data
        // (Sesuaikan path '/riwayat-surat' dengan routing di aplikasimu)
        navigate('/riwayat-surat', {
            state: {
                data_surat: formData,
                jenis_surat: 'Mutasi Keluar'
            }
        });
    };

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
                    <span className="text-white text-sm font-medium">Mutasi Keluar</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">Formulir Surat Mutasi Keluar</h1>
                    <p className="text-text-secondary text-base font-normal">Buat surat mutasi lengkap (Lembar 1, 2, & 3) dalam satu proses pengisian data.</p>
                </div>

                {/* Stepper */}
                <div className="w-full py-4">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-dark -z-10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: currentStep === 1 ? '33.33%' : currentStep === 2 ? '66.66%' : '100%' }}
                            ></div>
                        </div>

                        {[
                            { step: 1, label: 'Permohonan' },
                            { step: 2, label: 'Formulir Sekolah' },
                            { step: 3, label: 'Surat Keterangan' }
                        ].map((item) => (
                            <div
                                key={item.step}
                                onClick={() => setCurrentStep(item.step)}
                                className="flex flex-col items-center gap-2 bg-background-dark px-2 z-10 cursor-pointer group"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold transition-all ${currentStep >= item.step ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(80,72,229,0.5)]' : 'bg-surface-dark text-text-secondary border-surface-dark group-hover:border-primary/50'}`}>
                                    {item.step}
                                </div>
                                <span className={`text-xs font-semibold hidden sm:block ${currentStep >= item.step ? 'text-white' : 'text-text-secondary'}`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-12">
                    {/* Lembar 1: Permohonan Pindah */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/30"></div>
                        <div className="flex items-center justify-between border-b border-border-dark pb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">family_restroom</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-white text-lg font-bold">Lembar 1: Permohonan Pindah</h3>
                                    <span className="text-xs text-text-secondary">Diisi oleh Orang Tua/Wali Siswa</span>
                                </div>
                            </div>
                            <span className="bg-surface-dark text-xs px-2 py-1 rounded text-text-secondary">1 dari 3</span>
                        </div>

                        {/* Search Bar */}
                        <div className="bg-surface-dark/30 p-4 rounded-xl border border-border-dark flex flex-col gap-3">
                            <label className="flex flex-col gap-2">
                                <span className="text-white font-semibold text-sm">Cari Data Siswa (Auto-fill)</span>
                                <div className="flex w-full items-stretch rounded-xl h-11 bg-surface-dark focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                    <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                        <span className="material-symbols-outlined text-[20px]">search</span>
                                    </div>
                                    <input
                                        className="w-full bg-transparent border-none text-white placeholder:text-text-secondary/50 focus:ring-0 text-sm h-full px-2"
                                        placeholder="Ketik NIS atau Nama Siswa..."
                                    />
                                    <div className="pr-2 flex items-center">
                                        <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors" type="button">
                                            CARI
                                        </button>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Data Orang Tua */}
                        <div className="space-y-4">
                            <h4 className="text-white/80 text-sm font-bold uppercase tracking-wider border-b border-border-dark pb-2">A. Data Orang Tua / Wali</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-sm font-medium ml-1">Nama Lengkap Orang Tua</label>
                                    <input name="nama_orangtua" value={formData.nama_orangtua} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Budi Santoso" type="text" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-sm font-medium ml-1">Pekerjaan</label>
                                    <input name="pekerjaan_orangtua" value={formData.pekerjaan_orangtua} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: Wiraswasta" type="text" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-text-secondary text-sm font-medium ml-1">Alamat Orang Tua</label>
                                    <textarea name="alamat_orangtua" value={formData.alamat_orangtua} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 min-h-[80px] p-4 resize-none transition-all" placeholder="Alamat lengkap sesuai KTP..."></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Data Siswa */}
                        <div className="space-y-4 pt-4">
                            <h4 className="text-white/80 text-sm font-bold uppercase tracking-wider border-b border-border-dark pb-2">B. Data Siswa</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-text-secondary text-sm font-medium ml-1">Nama Lengkap Siswa</label>
                                    <input name="nama_siswa" value={formData.nama_siswa} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all" placeholder="Nama Siswa" type="text" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-sm font-medium ml-1">Nomor Induk Siswa (NIS)</label>
                                    <input name="nis" value={formData.nis} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all" placeholder="Nomor Induk Siswa" type="number" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-sm font-medium ml-1">NISN (Nomor Induk Siswa Nasional)</label>
                                    <input name="nisn" value={formData.nisn} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all" placeholder="Contoh: 0012345678" type="number" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-text-secondary text-sm font-medium ml-1">Jenis Kelamin</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <input className="hidden peer" id="gender_l" name="jenis_kelamin" type="radio" value="L" checked={formData.jenis_kelamin === 'L'} onChange={handleChange} />
                                            <label className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all border ${formData.jenis_kelamin === 'L' ? 'bg-primary/20 border-primary shadow-sm' : 'bg-surface-dark border-transparent hover:bg-surface-dark/80'}`} htmlFor="gender_l">
                                                <div className="flex items-center gap-3">
                                                    <span className={`material-symbols-outlined ${formData.jenis_kelamin === 'L' ? 'text-primary' : 'text-blue-400'}`}>male</span>
                                                    <span className="text-white font-medium">Laki-Laki</span>
                                                </div>
                                                <span className={`material-symbols-outlined text-primary transition-all ${formData.jenis_kelamin === 'L' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>check_circle</span>
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <input className="hidden peer" id="gender_p" name="jenis_kelamin" type="radio" value="P" checked={formData.jenis_kelamin === 'P'} onChange={handleChange} />
                                            <label className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all border ${formData.jenis_kelamin === 'P' ? 'bg-primary/20 border-primary shadow-sm' : 'bg-surface-dark border-transparent hover:bg-surface-dark/80'}`} htmlFor="gender_p">
                                                <div className="flex items-center gap-3">
                                                    <span className={`material-symbols-outlined ${formData.jenis_kelamin === 'P' ? 'text-primary' : 'text-pink-400'}`}>female</span>
                                                    <span className="text-white font-medium">Perempuan</span>
                                                </div>
                                                <span className={`material-symbols-outlined text-primary transition-all ${formData.jenis_kelamin === 'P' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>check_circle</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-sm font-medium ml-1">Kelas Saat Ini</label>
                                    <div className="relative">
                                        <select name="kelas" value={formData.kelas} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 appearance-none transition-all cursor-pointer">
                                            <option disabled value="">Pilih Kelas</option>
                                            <option value="7A">Kelas 7</option>
                                            <option value="8A">Kelas 8</option>
                                            <option value="9A">Kelas 9</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-sm font-medium ml-1">Sekolah Tujuan</label>
                                    <input name="sekolah_tujuan" value={formData.sekolah_tujuan} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Nama Sekolah Tujuan" type="text" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-text-secondary text-sm font-medium ml-1">Alasan Pindah</label>
                                    <textarea name="alasan_pindah" value={formData.alasan_pindah} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 min-h-[80px] p-4 resize-none transition-all" placeholder="Contoh: Mengikuti perpindahan tugas orang tua..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lembar 2: Formulir Pengajuan Pindah */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/30"></div>
                        <div className="flex items-center justify-between border-b border-border-dark pb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">assignment</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-white text-lg font-bold">Lembar 2: Formulir Pengajuan Pindah</h3>
                                    <span className="text-xs text-text-secondary">Format Dinas Pendidikan (Diknas)</span>
                                </div>
                            </div>
                            <span className="bg-surface-dark text-xs px-2 py-1 rounded text-text-secondary">2 dari 3</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nomor Surat Resmi</label>
                                <div className="relative">
                                    <input name="nomor_surat" value={formData.nomor_surat} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Contoh: MTs.11/PP.00.5/089/2026" type="text" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none text-[20px]">tag</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tempat Lahir</label>
                                <input name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all" placeholder="Kota Lahir" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Lahir</label>
                                <div className="relative">
                                    <input name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 appearance-none transition-all" type="date" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">calendar_today</span>
                                </div>
                            </div>
                            {/* Auto-fill dari Lembar 1 */}
                            <div className="md:col-span-2 space-y-2 opacity-70">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Siswa (Dari Lembar 1)</label>
                                <input value={formData.nama_siswa} className="w-full bg-surface-dark/50 text-text-secondary rounded-xl border border-border-dark h-12 px-4 cursor-not-allowed" disabled placeholder="Otomatis terisi..." type="text" />
                            </div>
                            <div className="space-y-2 opacity-70">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIS (Dari Lembar 1)</label>
                                <input value={formData.nis} className="w-full bg-surface-dark/50 text-text-secondary rounded-xl border border-border-dark h-12 px-4 cursor-not-allowed" disabled placeholder="Otomatis terisi..." type="text" />
                            </div>
                            <div className="space-y-2 opacity-70">
                                <label className="text-text-secondary text-sm font-medium ml-1">NISN (Dari Lembar 1)</label>
                                <input value={formData.nisn} className="w-full bg-surface-dark/50 text-text-secondary rounded-xl border border-border-dark h-12 px-4 cursor-not-allowed" disabled placeholder="Otomatis terisi..." type="text" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Asal Sekolah</label>
                                <input name="sekolah_asal" value={formData.sekolah_asal} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all" placeholder="Nama Sekolah Asal" type="text" />
                            </div>
                        </div>
                    </div>

                    {/* Lembar 3: Surat Keterangan Mutasi */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                        <div className="flex items-center justify-between border-b border-border-dark pb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">verified</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-white text-lg font-bold">Lembar 3: Surat Keterangan Mutasi</h3>
                                    <span className="text-xs text-text-secondary">Keterangan Sekolah Asal (Untuk Sekolah Tujuan)</span>
                                </div>
                            </div>
                            <span className="bg-surface-dark text-xs px-2 py-1 rounded text-text-secondary">3 dari 3</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Agama Siswa</label>
                                <div className="relative">
                                    <select name="agama" value={formData.agama} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 appearance-none cursor-pointer transition-all">
                                        <option disabled value="">Pilih Agama</option>
                                        <option value="Islam">Islam</option>
                                        <option value="Kristen">Kristen</option>
                                        <option value="Katolik">Katolik</option>
                                        <option value="Hindu">Hindu</option>
                                        <option value="Buddha">Buddha</option>
                                        <option value="Konghucu">Konghucu</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Meninggalkan Sekolah Pada Kelas</label>
                                <div className="relative">
                                    {/* Menggunakan state 'kelas' agar sinkron dengan Lembar 1 */}
                                    <select name="kelas" value={formData.kelas} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 appearance-none cursor-pointer transition-all">
                                        <option disabled value="">Pilih Tingkat</option>
                                        <option value="7A">Kelas 7</option>
                                        <option value="8A">Kelas 8</option>
                                        <option value="9A">Kelas 9</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Diterima di Sekolah Ini</label>
                                <div className="relative">
                                    <input name="tanggal_diterima" value={formData.tanggal_diterima} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 appearance-none transition-all" type="date" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">event_available</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Keluar</label>
                                <div className="relative">
                                    <input name="tanggal_keluar" value={formData.tanggal_keluar} onChange={handleChange} className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 appearance-none transition-all" type="date" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">event_busy</span>
                                </div>
                            </div>
                        </div>

                        {/* Signatory */}
                        <div className="mt-4 pt-4 border-t border-border-dark opacity-70">
                            <h4 className="text-white/80 text-sm font-bold uppercase tracking-wider mb-4">Penandatanganan Kepala Madrasah</h4>
                            <div className="p-4 bg-surface-dark/50 border border-border-dark rounded-xl flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <span className="text-sm text-text-secondary">Nama dan NIP Kepala Madrasah akan dicetak otomatis sesuai dengan data di <strong>Pengaturan Profil Sekolah</strong>.</span>
                            </div>
                        </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end pt-4">
                        <button
                            type="button"
                            className="h-12 px-8 rounded-xl border border-border-dark text-text-secondary font-bold hover:text-white hover:bg-surface-dark transition-all"
                        >
                            Simpan Draft
                        </button>
                        <button
                            type="submit"
                            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[20px]">print</span>
                            Generate 3 Lembar Surat
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OutgoingTransferLetter;
