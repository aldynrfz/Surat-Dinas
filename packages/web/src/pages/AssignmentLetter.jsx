import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllEmployees, addLetter, updateLetter } from '../services/dataService';
import Toast from '../components/Toast';
import { useSchool } from '../contexts/SchoolContext';

const AssignmentLetter = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { schoolData } = useSchool();
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const searchRef = useRef(null);
    const datePickerRef = useRef(null);
    const [editMode, setEditMode] = useState(false);
    const [letterId, setLetterId] = useState(null);

    // Helper: format date to Indonesian "Senin, 23 Februari 2026"
    const formatHariTanggal = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const [formData, setFormData] = useState({
        nomor_surat: '',
        nama: '',
        nip: '',
        pangkat_golongan: '',
        jabatan: '',
        unit_kerja: '',
        keperluan: '',
        hari_tanggal: '',
        waktu: '',
        tempat: '',
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
            }));
        }
    }, [schoolData, editMode]);

    useEffect(() => {
        fetchEmployees();

        // Check if we're editing an existing letter
        if (location.state?.letter) {
            const letter = location.state.letter;
            setEditMode(true);
            setLetterId(letter.id);
            if (letter.formData) {
                setFormData(letter.formData);
                if (letter.formData.nama) {
                    setSearchTerm(`${letter.formData.nama} - ${letter.formData.nip}`);
                }
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

    const fetchEmployees = async () => {
        try {
            const data = await getAllEmployees();
            setEmployees(data);
        } catch (error) {
            console.error("Error fetching employees:", error);
            showToast("Gagal memuat data pegawai", "error");
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 0) {
            const filtered = employees.filter(emp =>
                emp.name.toLowerCase().includes(term.toLowerCase()) ||
                emp.nip.includes(term)
            );
            setFilteredEmployees(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectEmployee = (employee) => {
        setFormData(prev => ({
            ...prev,
            nama: employee.name,
            nip: employee.nip,
            pangkat_golongan: `${employee.rank || ''} / ${employee.grade || ''}`,
            jabatan: employee.role,
            unit_kerja: 'MTsN 11 Tasikmalaya' // Default or from DB if available
        }));
        setSearchTerm(`${employee.name} - ${employee.nip}`);
        setShowSuggestions(false);
        showToast("Data pegawai berhasil diisi otomatis", "success");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveLetter = async (e, status = 'sent') => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const letterData = {
                letterType: 'surat_tugas',
                letterNumber: formData.nomor_surat,
                subject: `Surat Tugas - ${formData.keperluan.substring(0, 50)}...`,
                formData: formData,
                status: status,
                date: formData.tanggal_surat,
                employeeId: formData.nip,
                recipientName: formData.nama,
                type: 'outgoing'
            };

            if (editMode && letterId) {
                await updateLetter(letterId, letterData);
                showToast("Surat berhasil diperbarui!", "success");
            } else {
                await addLetter(letterData);
                showToast(`Surat berhasil disimpan ${status === 'draft' ? 'sebagai draft' : ''}!`, "success");
            }

            // Redirect to letter history
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

    const saveDraft = (e) => {
        saveLetter(e, 'draft');
    };

    return (
        <div className="flex-1 overflow-y-auto z-10 p-6 md:p-10 scroll-smooth relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
                    <span className="text-white text-sm font-medium">Surat Tugas</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">{editMode ? 'Edit' : 'Formulir'} Surat Tugas Pegawai</h1>
                    <p className="text-text-secondary text-base font-normal">{editMode ? 'Edit surat tugas yang sudah ada' : 'Buat dan kelola surat tugas dinas untuk pegawai atau guru secara efisien'}.</p>
                </div>

                {/* Search Section */}
                <div className="glass-panel p-6 rounded-2xl relative z-50" ref={searchRef}>
                    <label className="flex flex-col gap-3">
                        <span className="text-white font-semibold text-sm ml-1">Cari Data Pegawai (Auto-fill)</span>
                        <div className="flex w-full items-stretch rounded-xl h-12 bg-[#131221] border border-[#272546] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                            <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="w-full bg-transparent border-none text-white placeholder:text-text-secondary/50 focus:outline-none text-base h-full px-2"
                                placeholder="Ketik nama pegawai atau NIP..."
                                value={searchTerm}
                                onChange={handleSearch}
                                onFocus={() => searchTerm && setShowSuggestions(true)}
                            />
                        </div>
                    </label>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                        <div className="absolute left-6 right-6 top-[calc(100%-10px)] z-50 bg-[#1c1b2e] border border-[#383663] rounded-b-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map(emp => (
                                    <button
                                        key={emp.id}
                                        onClick={() => handleSelectEmployee(emp)}
                                        className="w-full text-left px-4 py-3 hover:bg-[#272546] border-b border-[#272546] last:border-0 transition-colors flex flex-col"
                                    >
                                        <span className="text-white font-medium">{emp.name}</span>
                                        <span className="text-xs text-[#9795c6]">{emp.nip} • {emp.role}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-[#9795c6] text-sm">Pegawai tidak ditemukan</div>
                            )}
                        </div>
                    )}

                    <div className="mt-3 flex items-start gap-2 text-xs text-text-secondary px-1">
                        <span className="material-symbols-outlined text-base">info</span>
                        <p>Data pegawai akan otomatis terisi jika NIP atau Nama ditemukan dalam database kepegawaian.</p>
                    </div>
                </div>

                <form onSubmit={saveLetter} className="flex flex-col gap-8 pb-12">
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
                                    <input
                                        name="nomor_surat"
                                        value={formData.nomor_surat}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary/30 h-12 px-4 transition-all"
                                        placeholder="Contoh: 800/045/SMK-TI/ST/XI/2024"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none text-[20px]">tag</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Identitas Pegawai */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Identitas Pegawai</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Lengkap</label>
                                <input name="nama" value={formData.nama} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: Budi Santoso, S.Pd." required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIP</label>
                                <input name="nip" value={formData.nip} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Nomor Induk Pegawai" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Pangkat / Golongan</label>
                                <input name="pangkat_golongan" value={formData.pangkat_golongan} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: Penata Muda / III a" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Jabatan</label>
                                <input name="jabatan" value={formData.jabatan} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: Guru Mata Pelajaran" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Unit Kerja</label>
                                <input name="unit_kerja" value={formData.unit_kerja} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: MTsN 11 Tasikmalaya" required />
                            </div>
                        </div>
                    </div>

                    {/* Detail Tugas */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">assignment</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Detail Tugas</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Keperluan Tugas</label>
                                <textarea name="keperluan" value={formData.keperluan} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px] p-4 resize-none" placeholder="Deskripsikan keperluan penugasan..." required></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Hari &amp; Tanggal Pelaksanaan</label>
                                <div className="relative flex items-center">
                                    <input
                                        name="hari_tanggal"
                                        value={formData.hari_tanggal}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 pr-12"
                                        placeholder="Contoh: Senin, 23 Februari 2026"
                                        required
                                    />
                                    {/* Hidden native date picker */}
                                    <input
                                        ref={datePickerRef}
                                        type="date"
                                        className="absolute right-0 opacity-0 w-0 h-0"
                                        tabIndex={-1}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                hari_tanggal: formatHariTanggal(raw)
                                            }));
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => datePickerRef.current?.showPicker?.() || datePickerRef.current?.click()}
                                        className="absolute right-3 text-[#9795c6] hover:text-white transition-colors"
                                        title="Pilih dari kalender"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Waktu Pelaksanaan</label>
                                <input name="waktu" value={formData.waktu} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: 08.00 WIB s.d Selesai" required />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tempat Pelaksanaan</label>
                                <input name="tempat" value={formData.tempat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: Kantor Kementerian Agama Kabupaten Tasikmalaya" required />
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
                                <label className="text-text-secondary text-sm font-medium ml-1">Tempat Surat (Kota/Kabupaten)</label>
                                <input name="kota_surat" value={formData.kota_surat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Surat</label>
                                <input name="tanggal_surat" value={formData.tanggal_surat} onChange={handleInputChange} type="date" className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Kepala Madrasah</label>
                                <div className="relative">
                                    <input
                                        name="kepala_madrasah"
                                        value={formData.kepala_madrasah}
                                        readOnly
                                        className="w-full bg-[#131221]/60 text-white/80 rounded-xl border border-[#272546] h-12 px-4 cursor-default"
                                        placeholder="Belum diatur di profil sekolah"
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-[#9795c6] pointer-events-none text-[20px]">account_circle</span>
                                </div>
                                <p className="text-xs text-[#686687] ml-1">Diambil otomatis dari Profil Sekolah</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIP Kepala Madrasah</label>
                                <div className="relative">
                                    <input name="nip_kepala" value={formData.nip_kepala} readOnly className="w-full bg-[#131221]/60 text-white/80 rounded-xl border border-[#272546] h-12 px-4 cursor-default" placeholder="Belum diatur di profil sekolah" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-[#9795c6] pointer-events-none text-[20px]">badge</span>
                                </div>
                                <p className="text-xs text-[#686687] ml-1">Diambil otomatis dari Profil Sekolah</p>
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
                                onClick={saveDraft}
                                disabled={isSaving}
                                className="h-12 px-8 rounded-xl border-2 border-amber-500 text-amber-400 hover:bg-amber-500/10 font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">draft</span>
                                        <span>Simpan Draft</span>
                                    </>
                                )}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    <span>{editMode ? 'Update Surat' : 'Simpan Surat'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignmentLetter;
