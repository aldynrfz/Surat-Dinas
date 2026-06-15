import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addLetter, updateLetter } from '../services/dataService'; // Sesuaikan path jika perlu
import Toast from '../components/Toast';
import { useSchool } from '../contexts/SchoolContext';

const IncomingTransferLetter = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { schoolData } = useSchool();

    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const searchRef = useRef(null);
    const [editMode, setEditMode] = useState(false);
    const [letterId, setLetterId] = useState(null);

    // Data Pendaftaran Dummy (Nanti bisa diganti fetch dari API/Database PPDB)
    const mockRegistrations = [
        { id: 1, regNum: 'PPDB-001', name: 'Ahmad Fauzan', tempat_lahir: 'Tasikmalaya', tanggal_lahir: '2010-05-15', nama_orang_tua: 'Budi Santoso', nisn: '0011223344', alamat: 'Jl. Raya Singaparna No. 10' },
        { id: 2, regNum: 'PPDB-002', name: 'Siti Aminah', tempat_lahir: 'Bandung', tanggal_lahir: '2011-08-20', nama_orang_tua: 'Asep Ridwan', nisn: '0055667788', alamat: 'Kp. Sukamaju, Tasikmalaya' }
    ];
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);

    // Form Data State
    const [formData, setFormData] = useState({
        nomor_surat: '',
        nama_siswa: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        nama_orang_tua: '',
        nisn: '',
        alamat: '',
        tanggal_diterima: new Date().toISOString().split('T')[0],
        kelas: '',
        kota_surat: 'Tasikmalaya',
        tanggal_surat: new Date().toISOString().split('T')[0],
        kepala_madrasah: '',
        nip_kepala: ''
    });

    // Auto-populate principal fields from school profile
    useEffect(() => {
        if (schoolData && !editMode) {
            setFormData(prev => ({
                ...prev,
                kepala_madrasah: schoolData.nama_kepala_madrasah || prev.kepala_madrasah,
                nip_kepala: schoolData.nip_kepala_madrasah || prev.nip_kepala,
                kota_surat: schoolData.kabupaten || prev.kota_surat
            }));
        }
    }, [schoolData, editMode]);

    // Check for Edit Mode
    useEffect(() => {
        if (location.state?.letter) {
            const letter = location.state.letter;
            setEditMode(true);
            setLetterId(letter.id);
            if (letter.formData) {
                setFormData(letter.formData);
            }
        }

        // Click outside to close suggestions
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [location.state]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Handle Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Auto-fill Search Handlers
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 0) {
            const filtered = mockRegistrations.filter(reg =>
                reg.name.toLowerCase().includes(term.toLowerCase()) ||
                reg.regNum.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredRegistrations(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectRegistration = (student) => {
        setFormData(prev => ({
            ...prev,
            nama_siswa: student.name,
            tempat_lahir: student.tempat_lahir,
            tanggal_lahir: student.tanggal_lahir,
            nama_orang_tua: student.nama_orang_tua,
            nisn: student.nisn,
            alamat: student.alamat
        }));
        setSearchTerm(`${student.name} - ${student.regNum}`);
        setShowSuggestions(false);
        showToast("Data pendaftaran berhasil diisi otomatis", "success");
    };

    // Save Logic
    const saveLetter = async (e, status = 'sent') => {
        e.preventDefault();

        if (!formData.nama_siswa || !formData.nomor_surat) {
            showToast("Nama Siswa dan Nomor Surat wajib diisi!", "error");
            return;
        }

        setIsSaving(true);

        try {
            const letterData = {
                letterType: 'mutasi_masuk', // KUNCI PENTING UNTUK CONDITIONAL RENDERING DI RIWAYAT
                letterNumber: formData.nomor_surat,
                subject: `Surat Mutasi Masuk - ${formData.nama_siswa}`,
                formData: formData,
                status: status,
                date: formData.tanggal_surat,
                recipientName: formData.nama_siswa,
                type: 'incoming' // Karena ini mutasi masuk
            };

            if (editMode && letterId) {
                await updateLetter(letterId, letterData);
                showToast("Surat Mutasi Masuk berhasil diperbarui!", "success");
            } else {
                await addLetter(letterData);
                showToast(`Surat berhasil disimpan ${status === 'draft' ? 'sebagai draft' : ''}!`, "success");
            }

            setTimeout(() => {
                navigate(status === 'draft' ? '/riwayat-surat?tab=draft' : '/riwayat-surat');
            }, 1000);
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan surat: " + error.message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto z-10 p-6 md:p-10 scroll-smooth relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-[960px] mx-auto flex flex-col gap-8">

                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 px-1">
                    <button onClick={() => navigate('/')} className="text-text-secondary text-sm font-medium hover:text-primary transition-colors">
                        Dashboard
                    </button>
                    <span className="text-text-secondary text-sm font-medium">/</span>
                    <button onClick={() => navigate('/layanan-surat')} className="text-text-secondary text-sm font-medium hover:text-primary transition-colors">
                        Layanan Surat
                    </button>
                    <span className="text-text-secondary text-sm font-medium">/</span>
                    <span className="text-white text-sm font-medium">Mutasi Masuk</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                        {editMode ? 'Edit' : 'Formulir'} Surat Mutasi Masuk
                    </h1>
                    <p className="text-text-secondary text-base font-normal">
                        Buat dan kelola surat keterangan penerimaan mutasi siswa dari sekolah lain.
                    </p>
                </div>

                {/* Search Section */}
                <div className="glass-panel p-6 rounded-2xl relative z-50" ref={searchRef}>
                    <label className="flex flex-col gap-3">
                        <span className="text-white font-semibold text-sm ml-1">Cari Data Pendaftaran (Auto-fill)</span>
                        <div className="flex w-full items-stretch rounded-xl h-12 bg-[#131221] border border-[#272546] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                            <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="w-full bg-transparent border-none text-white placeholder:text-text-secondary/50 focus:outline-none text-base h-full px-2"
                                placeholder="Ketik nama siswa atau nomor pendaftaran..."
                                value={searchTerm}
                                onChange={handleSearch}
                                onFocus={() => searchTerm && setShowSuggestions(true)}
                            />
                        </div>
                    </label>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                        <div className="absolute left-6 right-6 top-[calc(100%-10px)] z-50 bg-[#1c1b2e] border border-[#383663] rounded-b-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredRegistrations.length > 0 ? (
                                filteredRegistrations.map(reg => (
                                    <button
                                        key={reg.id}
                                        type="button"
                                        onClick={() => handleSelectRegistration(reg)}
                                        className="w-full text-left px-4 py-3 hover:bg-[#272546] border-b border-[#272546] last:border-0 transition-colors flex flex-col"
                                    >
                                        <span className="text-white font-medium">{reg.name}</span>
                                        <span className="text-xs text-[#9795c6]">No. Daftar: {reg.regNum} • NISN: {reg.nisn}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-[#9795c6] text-sm">Data pendaftaran tidak ditemukan</div>
                            )}
                        </div>
                    )}
                    <div className="mt-3 flex items-start gap-2 text-xs text-text-secondary px-1">
                        <span className="material-symbols-outlined text-base">info</span>
                        <p>Gunakan fitur ini jika data siswa sudah tersimpan di database PPDB untuk mengisi formulir secara otomatis.</p>
                    </div>
                </div>

                <form onSubmit={(e) => saveLetter(e, 'sent')} className="flex flex-col gap-8 pb-12">
                    {/* Information Section */}
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
                                    <input
                                        name="nomor_surat"
                                        value={formData.nomor_surat}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all"
                                        placeholder="Contoh: MTs.11/PP.00.5/089/2026"
                                        type="text"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none text-[20px]">tag</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Personal Data */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Data Pribadi Siswa</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Lengkap Siswa</label>
                                <input name="nama_siswa" value={formData.nama_siswa} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all" placeholder="Contoh: Ahmad Fauzan" type="text" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tempat Lahir</label>
                                <input name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all" placeholder="Contoh: Tasikmalaya" type="text" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Lahir</label>
                                <div className="relative">
                                    <input name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all" type="date" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Orang Tua / Wali</label>
                                <input name="nama_orang_tua" value={formData.nama_orang_tua} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all" placeholder="Nama Ayah/Ibu" type="text" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NISN</label>
                                <input name="nisn" value={formData.nisn} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all" placeholder="Nomor Induk Siswa Nasional" type="number" required />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Alamat Lengkap</label>
                                <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px] p-4 resize-none transition-all" placeholder="Alamat lengkap siswa..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Admission Detail */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">assignment_turned_in</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Detail Penerimaan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Diterima</label>
                                <div className="relative">
                                    <input name="tanggal_diterima" value={formData.tanggal_diterima} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all" type="date" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Diterima di Kelas</label>
                                <div className="relative">
                                    <select name="kelas" value={formData.kelas} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all appearance-none cursor-pointer" required>
                                        <option disabled value="">Pilih Kelas</option>
                                        <option value="7">Kelas 7</option>
                                        <option value="8">Kelas 8</option>
                                        <option value="9">Kelas 9</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-[#9795c6] pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* signing */}
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
                                <input name="kota_surat" value={formData.kota_surat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Surat</label>
                                <input name="tanggal_surat" value={formData.tanggal_surat} onChange={handleInputChange} type="date" className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Kepala Madrasah</label>
                                <div className="relative">
                                    <input value={formData.kepala_madrasah} readOnly className="w-full bg-[#131221]/60 text-white/80 rounded-xl border border-[#272546] h-12 px-4 cursor-default" placeholder="Belum diatur di profil sekolah" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-[#9795c6] pointer-events-none text-[20px]">account_circle</span>
                                </div>
                                <p className="text-xs text-[#686687] ml-1">Diambil otomatis dari Profil Sekolah</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIP Kepala Madrasah</label>
                                <div className="relative">
                                    <input value={formData.nip_kepala} readOnly className="w-full bg-[#131221]/60 text-white/80 rounded-xl border border-[#272546] h-12 px-4 cursor-default" placeholder="Belum diatur di profil sekolah" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-[#9795c6] pointer-events-none text-[20px]">badge</span>
                                </div>
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
                        {!editMode && (
                            <button
                                type="button"
                                onClick={(e) => saveLetter(e, 'draft')}
                                disabled={isSaving}
                                className="h-12 px-8 rounded-xl border-2 border-amber-500 text-amber-400 hover:bg-amber-500/10 font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[20px]">draft</span>
                                Simpan Draft
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    {editMode ? 'Update Surat' : 'Simpan Surat'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IncomingTransferLetter;