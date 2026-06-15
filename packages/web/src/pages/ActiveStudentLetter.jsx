import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllStudents, addLetter, updateLetter } from '../services/dataService';
import Toast from '../components/Toast';
import { useSchool } from '../contexts/SchoolContext';

const ActiveStudentLetter = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { schoolData } = useSchool();
    
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const searchRef = useRef(null);
    
    const [editMode, setEditMode] = useState(false);
    const [letterId, setLetterId] = useState(null);

    const [formData, setFormData] = useState({
        nomor_surat: '',
        nama: '',
        tempat_lahir: '',
        tgl_lahir: '',
        nisn: '',
        kelas: '',
        tahun_pelajaran: '2023/2024',
        nama_orangtua: '',
        alamat: '',
        kota_surat: 'Tasikmalaya',
        tanggal_surat: new Date().toISOString().split('T')[0],
        nama_kepala: '',
        nip_kepala: ''
    });

    // Auto-populate principal fields from school profile
    useEffect(() => {
        if (schoolData && !editMode) {
            setFormData(prev => ({
                ...prev,
                nama_kepala: schoolData.nama_kepala_madrasah || prev.nama_kepala,
                nip_kepala: schoolData.nip_kepala_madrasah || prev.nip_kepala,
                kota_surat: schoolData.kota || prev.kota_surat
            }));
        }
    }, [schoolData, editMode]);

    useEffect(() => {
        fetchStudents();

        // Check if we're editing an existing letter
        if (location.state?.letter) {
            const letter = location.state.letter;
            setEditMode(true);
            setLetterId(letter.id);
            if (letter.formData) {
                setFormData(letter.formData);
                if (letter.formData.nama) {
                    setSearchTerm(`${letter.formData.nama} - ${letter.formData.nisn || ''}`);
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

    const fetchStudents = async () => {
        try {
            const data = await getAllStudents();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
            showToast("Gagal memuat data siswa", "error");
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
            const filtered = students.filter(std =>
                (std.name && std.name.toLowerCase().includes(term.toLowerCase())) ||
                (std.nisn && std.nisn.includes(term))
            );
            setFilteredStudents(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectStudent = (student) => {
        setFormData(prev => ({
            ...prev,
            nama: student.name || '',
            tempat_lahir: student.placeOfBirth || '',
            tgl_lahir: student.dateOfBirth || '',
            nisn: student.nisn || '',
            kelas: student.groupName || student.kelas || '',
            tahun_pelajaran: student.tahun_pelajaran || prev.tahun_pelajaran,
            nama_orangtua: student.parentName || student.nama_orangtua || '',
            alamat: student.address || ''
        }));
        setSearchTerm(`${student.name} - ${student.nisn || ''}`);
        setShowSuggestions(false);
        showToast("Data siswa berhasil diisi otomatis", "success");
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
            // Need to transform some date values for Word Template mapping later
            // The mapping format should be consistent with the backend logic.
            const letterData = {
                letterType: 'surat_keterangan_siswa_aktif',
                letterNumber: formData.nomor_surat,
                subject: `Surat Keterangan Siswa Aktif - ${formData.nama}`,
                formData: formData,
                status: status,
                date: formData.tanggal_surat,
                employeeId: formData.nisn, // Using NISN as the ID field for tracking
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
                        Layanan Surat
                    </button>
                    <span className="text-text-secondary text-sm font-medium">/</span>
                    <span className="text-white text-sm font-medium">Surat Keterangan Siswa Aktif</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">{editMode ? 'Edit' : 'Formulir'} Surat Keterangan Siswa Aktif</h1>
                    <p className="text-text-secondary text-base font-normal">{editMode ? 'Edit surat keterangan siswa aktif yang sudah ada' : 'Buat dan kelola surat keterangan aktif untuk siswa secara efisien'}.</p>
                </div>

                {/* Search Section */}
                <div className="glass-panel p-6 rounded-2xl relative z-50" ref={searchRef}>
                    <label className="flex flex-col gap-3">
                        <span className="text-white font-semibold text-sm ml-1">Cari Data Siswa (Auto-fill)</span>
                        <div className="flex w-full items-stretch rounded-xl h-12 bg-[#131221] border border-[#272546] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                            <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="w-full bg-transparent border-none text-white placeholder:text-text-secondary/50 focus:outline-none text-base h-full px-2"
                                placeholder="Ketik nama siswa atau NISN..."
                                value={searchTerm}
                                onChange={handleSearch}
                                onFocus={() => searchTerm && setShowSuggestions(true)}
                            />
                        </div>
                    </label>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                        <div className="absolute left-6 right-6 top-[calc(100%-10px)] z-50 bg-[#1c1b2e] border border-[#383663] rounded-b-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map(std => (
                                    <button
                                        key={std.id}
                                        onClick={() => handleSelectStudent(std)}
                                        className="w-full text-left px-4 py-3 hover:bg-[#272546] border-b border-[#272546] last:border-0 transition-colors flex flex-col"
                                    >
                                        <span className="text-white font-medium">{std.name}</span>
                                        <span className="text-xs text-[#9795c6]">NISN: {std.nisn || '-'} • Kelas: {std.groupName || std.kelas || '-'}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-[#9795c6] text-sm">Siswa tidak ditemukan, silahkan ketik manual pada form di bawah.</div>
                            )}
                        </div>
                    )}

                    <div className="mt-3 flex items-start gap-2 text-xs text-text-secondary px-1">
                        <span className="material-symbols-outlined text-base">info</span>
                        <p>Data siswa akan otomatis terisi jika NISN atau Nama ditemukan dalam database siswa. Anda juga dapat mengetik manual jika siswa belum ada di database.</p>
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
                                        placeholder="Contoh: 421.5/028/SMK-MA/X/2024"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none text-[20px]">tag</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Identitas Siswa */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">school</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Identitas Siswa</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Lengkap Siswa</label>
                                <input name="nama" value={formData.nama} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: Ahmad Fadli" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tempat Lahir</label>
                                <input name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: Tasikmalaya" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Lahir</label>
                                <input name="tgl_lahir" type="date" value={formData.tgl_lahir} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NISN</label>
                                <input name="nisn" value={formData.nisn} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: 0051234567" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Kelas</label>
                                <input name="kelas" value={formData.kelas} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: X - RPL 1" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tahun Pelajaran</label>
                                <input name="tahun_pelajaran" value={formData.tahun_pelajaran} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: 2023/2024" required />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Orang Tua / Wali</label>
                                <input name="nama_orangtua" value={formData.nama_orangtua} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4" placeholder="Contoh: Budi Santoso" required />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Alamat Lengkap</label>
                                <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px] p-4 resize-none" placeholder="Alamat lengkap siswa..." required></textarea>
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
                                        name="nama_kepala"
                                        value={formData.nama_kepala}
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

export default ActiveStudentLetter;
