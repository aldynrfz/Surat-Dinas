import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllEmployees, addLetter, updateLetter, getAllBMN } from '../services/dataService';
import Toast from '../components/Toast';
import { useSchool } from '../contexts/SchoolContext';

// Import Flatpickr
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import { Indonesian } from "flatpickr/dist/l10n/id.js";

const BmnBorrowLetter = () => {
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
    
    // BMN states
    const [bmnDataList, setBmnDataList] = useState([]);
    const [bmnSearchTerm, setBmnSearchTerm] = useState('');
    const [filteredBmn, setFilteredBmn] = useState([]);
    const [showBmnSuggestions, setShowBmnSuggestions] = useState(false);
    const bmnSearchRef = useRef(null);

    const [editMode, setEditMode] = useState(false);
    const [letterId, setLetterId] = useState(null);

    const [formData, setFormData] = useState({
        nomor_surat: '',
        nama: '',
        nip: '',
        pangkat_golongan: '',
        jabatan: '',
        alamat: '',
        jenis_barang: '',
        merk_type: '',
        warna: '',
        jumlah: '',
        kode_barang: '',
        tahun_perolehan: '',
        tempat_surat: 'Tasikmalaya',
        tanggal_surat: new Date().toISOString().split('T')[0],
        nama_kepala: '',
        nip_kepala: '',
    });

    // Auto-populate kepala madrasah from school profile
    useEffect(() => {
        if (schoolData && !editMode) {
            setFormData(prev => ({
                ...prev,
                nama_kepala: schoolData.nama_kepala_madrasah || prev.nama_kepala,
                nip_kepala: schoolData.nip_kepala_madrasah || prev.nip_kepala,
            }));
        }
    }, [schoolData, editMode]);

    useEffect(() => {
        fetchEmployees();
        fetchBmn();

        // Edit mode
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

        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (bmnSearchRef.current && !bmnSearchRef.current.contains(event.target)) {
                setShowBmnSuggestions(false);
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

    const fetchBmn = async () => {
        try {
            const data = await getAllBMN();
            setBmnDataList(data);
        } catch (error) {
            console.error("Error fetching BMN:", error);
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

    const handleBmnSearch = (e) => {
        const term = e.target.value;
        setBmnSearchTerm(term);
        if (term.length > 0) {
            const filtered = bmnDataList.filter(bmn =>
                (bmn.nama_barang && bmn.nama_barang.toLowerCase().includes(term.toLowerCase())) ||
                (bmn.kode_barang && bmn.kode_barang.includes(term))
            );
            setFilteredBmn(filtered);
            setShowBmnSuggestions(true);
        } else {
            setShowBmnSuggestions(false);
        }
    };

    const handleSelectEmployee = (employee) => {
        // Build alamat lengkap from detailed fields
        const alamatParts = [
            employee.address,
            employee.rt && employee.rw ? `RT ${employee.rt}/RW ${employee.rw}` : '',
            employee.village ? `Desa ${employee.village}` : '',
            employee.district ? `Kec. ${employee.district}` : '',
            employee.city ? `Kab. ${employee.city}` : '',
            employee.province || ''
        ].filter(Boolean).join(', ');

        setFormData(prev => ({
            ...prev,
            nama: employee.name,
            nip: employee.nip,
            pangkat_golongan: `${employee.rank || ''} / ${employee.grade || ''}`,
            jabatan: employee.role || '',
            alamat: alamatParts || employee.address || prev.alamat,
        }));
        setSearchTerm(`${employee.name} - ${employee.nip}`);
        setShowSuggestions(false);
        showToast("Data pegawai berhasil diisi otomatis", "success");
    };

    const handleSelectBmn = (bmn) => {
        setFormData(prev => ({
            ...prev,
            jenis_barang: bmn.nama_barang || '',
            merk_type: bmn.merk_type || '',
            warna: bmn.warna || '',
            kode_barang: bmn.kode_barang || '',
            tahun_perolehan: bmn.tahun_pengadaan || '',
            jumlah: '1 Unit' // Default
        }));
        setBmnSearchTerm(`${bmn.nama_barang} - ${bmn.kode_barang}`);
        setShowBmnSuggestions(false);
        showToast("Data barang berhasil diisi otomatis", "success");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, dateStr) => {
        setFormData(prev => ({ ...prev, [name]: dateStr }));
    };

    const saveLetter = async (e, status = 'sent') => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const letterData = {
                letterType: 'izin_pinjam_bmn',
                letterNumber: formData.nomor_surat,
                subject: `Izin Pinjam BMN - ${formData.jenis_barang || formData.nama}`,
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

    const saveDraft = (e) => saveLetter(e, 'draft');

    const inputClass = "w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary/30 h-12 px-4 transition-all";
    const readOnlyClass = "w-full bg-[#131221]/60 text-white/80 rounded-xl border border-[#272546] h-12 px-4 cursor-default";

    return (
        <div className="flex-1 overflow-y-auto z-10 p-6 md:p-10 scroll-smooth relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-[960px] mx-auto flex flex-col gap-8">

                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 px-1">
                    <button onClick={() => navigate('/')} className="text-text-secondary text-sm font-medium hover:text-primary transition-colors">Dashboard</button>
                    <span className="text-text-secondary text-sm font-medium">/</span>
                    <button onClick={() => navigate('/layanan-surat')} className="text-text-secondary text-sm font-medium hover:text-primary transition-colors">Surat Dinas</button>
                    <span className="text-text-secondary text-sm font-medium">/</span>
                    <span className="text-white text-sm font-medium">Izin Pinjam BMN</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">{editMode ? 'Edit' : 'Formulir'} Izin Pemakaian BMN</h1>
                    <p className="text-text-secondary text-base font-normal">{editMode ? 'Edit surat izin pemakaian BMN yang sudah ada' : 'Buat surat izin pemakaian Barang Milik Negara untuk pegawai'}.</p>
                </div>

                {/* Search Section - Employee Auto-fill */}
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

                    {showSuggestions && (
                        <div className="absolute left-6 right-6 top-[calc(100%-10px)] z-50 bg-[#1c1b2e] border border-[#383663] rounded-b-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map(emp => (
                                    <button
                                        key={emp.id}
                                        type="button"
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
                    {/* Nomor Surat */}
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
                                    <input name="nomor_surat" value={formData.nomor_surat} onChange={handleInputChange}
                                        className={inputClass} placeholder="Contoh: B-001/Ka.10.06/1/MN.01/01/2026" required />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none text-[20px]">tag</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Identitas Peminjam */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Identitas Peminjam</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Lengkap</label>
                                <input name="nama" value={formData.nama} onChange={handleInputChange} className={inputClass} placeholder="Contoh: Budi Santoso, S.Pd." required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIP</label>
                                <input name="nip" value={formData.nip} onChange={handleInputChange} className={inputClass} placeholder="Nomor Induk Pegawai" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Pangkat / Golongan</label>
                                <input name="pangkat_golongan" value={formData.pangkat_golongan} onChange={handleInputChange} className={inputClass} placeholder="Contoh: Penata Muda / III a" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Jabatan</label>
                                <input name="jabatan" value={formData.jabatan} onChange={handleInputChange} className={inputClass} placeholder="Contoh: Guru Mata Pelajaran" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Alamat</label>
                                <input name="alamat" value={formData.alamat} onChange={handleInputChange} className={inputClass} placeholder="Alamat lengkap pegawai" />
                            </div>
                        </div>
                    </div>

                    {/* Data Barang */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6" ref={bmnSearchRef}>
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                                <span className="material-symbols-outlined">inventory_2</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Data Barang</h3>
                        </div>

                        {/* BMN Auto-fill Search */}
                        <div className="relative">
                            <label className="text-white font-semibold text-sm ml-1 mb-2 block">Cari Barang (Auto-fill dari BMN)</label>
                            <div className="flex w-full items-stretch rounded-xl h-12 bg-[#131221] border border-[#272546] focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                                <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    className="w-full bg-transparent border-none text-white placeholder:text-text-secondary/50 focus:outline-none text-base h-full px-2"
                                    placeholder="Ketik nama atau kode barang..."
                                    value={bmnSearchTerm}
                                    onChange={handleBmnSearch}
                                    onFocus={() => bmnSearchTerm && setShowBmnSuggestions(true)}
                                />
                            </div>

                            {/* Suggestions Dropdown */}
                            {showBmnSuggestions && (
                                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#1c1b2e] border border-[#383663] rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                                    {filteredBmn.length > 0 ? (
                                        filteredBmn.map(bmn => (
                                            <button
                                                key={bmn.id}
                                                type="button"
                                                onClick={() => handleSelectBmn(bmn)}
                                                className="w-full text-left px-4 py-3 hover:bg-[#272546] border-b border-[#272546] last:border-0 transition-colors flex flex-col"
                                            >
                                                <span className="text-white font-medium">{bmn.nama_barang}</span>
                                                <span className="text-xs text-[#9795c6]">Kode: {bmn.kode_barang || '-'} • Merk: {bmn.merk_type || '-'}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-[#9795c6] text-sm">Barang tidak ditemukan</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Jenis Barang</label>
                                <input name="jenis_barang" value={formData.jenis_barang} onChange={handleInputChange} className={inputClass} placeholder="Contoh: Laptop, Kendaraan Dinas, Proyektor" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Merk / Type</label>
                                <input name="merk_type" value={formData.merk_type} onChange={handleInputChange} className={inputClass} placeholder="Contoh: Asus VivoBook / Toyota Avanza" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Warna</label>
                                <input name="warna" value={formData.warna} onChange={handleInputChange} className={inputClass} placeholder="Contoh: Hitam" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Jumlah</label>
                                <input name="jumlah" value={formData.jumlah} onChange={handleInputChange} className={inputClass} placeholder="Contoh: 1 Unit" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Kode Barang</label>
                                <input name="kode_barang" value={formData.kode_barang} onChange={handleInputChange} className={inputClass} placeholder="Contoh: 6.01.01.01.01.999.0001" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tahun Perolehan</label>
                                <input name="tahun_perolehan" value={formData.tahun_perolehan} onChange={handleInputChange} className={inputClass} placeholder="Contoh: 2024" />
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
                                <input name="tempat_surat" value={formData.tempat_surat} onChange={handleInputChange} className={inputClass} required />
                            </div>
                            {/* FLATPICKR: TANGGAL SURAT */}
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Surat</label>
                                <div className="relative group">
                                    <Flatpickr
                                        value={formData.tanggal_surat}
                                        onChange={([date], dateStr) => handleDateChange('tanggal_surat', dateStr)}
                                        options={{
                                            locale: Indonesian,
                                            dateFormat: "Y-m-d",
                                            altInput: true,
                                            altFormat: "d F Y",
                                            disableMobile: true
                                        }}
                                        className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] group-hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all duration-300 ease-in-out cursor-pointer"
                                        placeholder="Pilih Tanggal Surat"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-[#9795c6] group-hover:text-primary transition-colors duration-300 pointer-events-none text-[20px]">
                                        calendar_month
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Kuasa Pengguna Barang (Kepala Madrasah)</label>
                                <div className="relative">
                                    <input name="nama_kepala" value={formData.nama_kepala} readOnly className={readOnlyClass} placeholder="Belum diatur di profil sekolah" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-[#9795c6] pointer-events-none text-[20px]">account_circle</span>
                                </div>
                                <p className="text-xs text-[#686687] ml-1">Diambil otomatis dari Profil Sekolah</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIP Kepala Madrasah</label>
                                <div className="relative">
                                    <input name="nip_kepala" value={formData.nip_kepala} readOnly className={readOnlyClass} placeholder="Belum diatur di profil sekolah" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-[#9795c6] pointer-events-none text-[20px]">badge</span>
                                </div>
                                <p className="text-xs text-[#686687] ml-1">Diambil otomatis dari Profil Sekolah</p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end pt-4">
                        <button type="button" onClick={() => navigate('/layanan-surat')}
                            className="h-12 px-8 rounded-xl border border-border-dark text-text-secondary font-bold hover:text-white hover:bg-surface-dark transition-all">
                            Batalkan
                        </button>
                        {!editMode && (
                            <button type="button" onClick={saveDraft} disabled={isSaving}
                                className="h-12 px-8 rounded-xl border-2 border-amber-500 text-amber-400 hover:bg-amber-500/10 font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSaving ? (
                                    <><span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span><span>Menyimpan...</span></>
                                ) : (
                                    <><span className="material-symbols-outlined text-[20px]">draft</span><span>Simpan Draft</span></>
                                )}
                            </button>
                        )}
                        <button type="submit" disabled={isSaving}
                            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSaving ? (
                                <><span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span><span>Menyimpan...</span></>
                            ) : (
                                <><span className="material-symbols-outlined text-[20px]">save</span><span>{editMode ? 'Update Surat' : 'Simpan Surat'}</span></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BmnBorrowLetter;
