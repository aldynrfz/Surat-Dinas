import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addLetter, updateLetter, getAllStudents, getAllEmployees } from '../services/dataService';
import Toast from '../components/Toast';
import { useSchool } from '../contexts/SchoolContext';

// Import Flatpickr
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import { Indonesian } from "flatpickr/dist/l10n/id.js";

const ParentCallLetter = () => {
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

    // Data Siswa
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);

    // Data Pegawai
    const [employees, setEmployees] = useState([]);
    const [activeEmployeeField, setActiveEmployeeField] = useState(null);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const employeeSearchRef = useRef(null);

    // Form Data State
    const [formData, setFormData] = useState({
        nomor_surat: '',
        tempat_surat: 'Tasikmalaya',
        tgl_surat: new Date().toISOString().split('T')[0],
        lampiran: '-',

        nama: '',
        kelas: '',

        hari_tanggal: new Date().toISOString().split('T')[0],
        waktu: '09.00 WIB',
        tempat: 'MTsN 11 Tasikmalaya',

        wali_kelas: '',
        nip_wali_kelas: '',
        kordinator_bp: '',
        nip_kordinator_bp: '',
        waka_kesiswaan: '',
        nip_waka_kesiswaan: ''
    });

    // Fetch Students on Mount
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await getAllStudents();
                setStudents(data);
            } catch (error) {
                console.error("Gagal memuat data siswa:", error);
            }
        };
        const fetchEmployees = async () => {
            try {
                const empData = await getAllEmployees();
                setEmployees(empData);
            } catch (error) {
                console.error("Gagal memuat data pegawai:", error);
            }
        };
        fetchStudents();
        fetchEmployees();
    }, []);

    // Auto-populate School Data
    useEffect(() => {
        if (schoolData && !editMode) {
            setFormData(prev => ({
                ...prev,
                tempat_surat: schoolData.kecamatan || prev.tempat_surat,
                tempat: schoolData.nama_madrasah || prev.tempat
            }));
        }
    }, [schoolData, editMode]);

    // Check for Edit Mode
    useEffect(() => {
        if (location.state?.letter) {
            const letter = location.state.letter;
            setEditMode(true);
            setLetterId(letter.id);
            if (letter.formData) setFormData(letter.formData);
        }

        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (employeeSearchRef.current && !employeeSearchRef.current.contains(event.target)) {
                setActiveEmployeeField(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [location.state]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, dateStr) => {
        setFormData(prev => ({ ...prev, [name]: dateStr }));
    };

    // Auto-fill Student Logic
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 0) {
            const filtered = students.filter(s =>
                s.name?.toLowerCase().includes(term.toLowerCase()) ||
                s.nisn?.includes(term)
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
            kelas: student.class || student.groupName || ''
        }));
        setSearchTerm(`${student.name} - ${student.class || student.groupName}`);
        setShowSuggestions(false);
        showToast("Data siswa berhasil dimuat", "success");
    };

    const handleEmployeeSearch = (name, term) => {
        handleInputChange({ target: { name, value: term }});
        setActiveEmployeeField(name);
        if (term.length > 0) {
            setFilteredEmployees(employees.filter(e => e.name?.toLowerCase().includes(term.toLowerCase())));
        } else {
            setFilteredEmployees([]);
        }
    };

    const handleSelectEmployee = (field, emp) => {
        let nipField = field === 'wali_kelas' ? 'nip_wali_kelas' : field === 'kordinator_bp' ? 'nip_kordinator_bp' : 'nip_waka_kesiswaan';
        setFormData(prev => ({
            ...prev,
            [field]: emp.name,
            [nipField]: emp.nip
        }));
        setActiveEmployeeField(null);
        showToast("Data pegawai berhasil dipilih", "success");
    };

    const saveLetter = async (e, status = 'sent') => {
        e.preventDefault();

        if (!formData.nama || !formData.nomor_surat) {
            showToast("Nama Siswa dan Nomor Surat wajib diisi!", "error");
            return;
        }

        setIsSaving(true);
        try {
            const letterData = {
                letterType: 'panggilan_orang_tua',
                letterNumber: formData.nomor_surat,
                subject: `Panggilan Orang Tua - ${formData.nama}`,
                formData: formData,
                status: status,
                date: formData.tgl_surat,
                recipientName: `Orang Tua/Wali ${formData.nama}`,
                type: 'outgoing'
            };

            if (editMode && letterId) {
                await updateLetter(letterId, letterData);
                showToast("Surat Berhasil diperbarui!", "success");
            } else {
                await addLetter(letterData);
                showToast(`Surat Berhasil disimpan ${status === 'draft' ? 'sebagai draft' : ''}!`, "success");
            }

            setTimeout(() => {
                navigate(status === 'draft' ? '/riwayat-surat?tab=draft' : '/riwayat-surat');
            }, 1000);
        } catch (error) {
            showToast("Gagal menyimpan: " + error.message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto z-10 p-6 md:p-10 scroll-smooth relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-[960px] mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight">Panggilan Orang Tua</h1>
                    <p className="text-text-secondary text-base">Surat resmi panggilan orang tua/wali murid ke sekolah.</p>
                </div>

                {/* Auto-fill Search */}
                <div className="glass-panel p-6 rounded-2xl relative z-50" ref={searchRef}>
                    <label className="flex flex-col gap-3">
                        <span className="text-white font-semibold text-sm ml-1">Cari Nama Siswa (Auto-fill)</span>
                        <div className="flex w-full items-stretch rounded-xl h-12 bg-[#131221] border border-[#272546] focus-within:border-primary transition-all">
                            <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                <span className="material-symbols-outlined">person_search</span>
                            </div>
                            <input className="w-full bg-transparent border-none text-white focus:outline-none px-2" placeholder="Ketik nama atau NISN siswa..." value={searchTerm} onChange={handleSearch} onFocus={() => searchTerm && setShowSuggestions(true)} />
                        </div>
                    </label>
                    {showSuggestions && (
                        <div className="absolute left-6 right-6 top-[calc(100%-10px)] z-50 bg-[#1c1b2e] border border-[#383663] rounded-b-xl shadow-2xl max-h-40 overflow-y-auto custom-scrollbar">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map(s => (
                                    <button key={s.id} type="button" onClick={() => handleSelectStudent(s)} className="w-full text-left px-4 py-3 hover:bg-[#272546] border-b border-[#272546] transition-colors flex flex-col">
                                        <span className="text-white font-medium">{s.name}</span>
                                        <span className="text-xs text-[#9795c6]">Kelas: {s.class || '-'} • NISN: {s.nisn || '-'}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-[#9795c6]">Siswa tidak ditemukan di database.</div>
                            )}
                        </div>
                    )}
                </div>

                <form onSubmit={(e) => saveLetter(e, 'sent')} className="flex flex-col gap-8 pb-12">

                    {/* Panel 1: Administrasi Surat */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary"><span className="material-symbols-outlined">description</span></div>
                            <h3 className="text-white text-lg font-bold">1. Administrasi Surat</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Nomor Surat</label>
                                <input name="nomor_surat" value={formData.nomor_surat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" placeholder="Misal: B-114/MTs.10.06..." required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Lampiran</label>
                                <input name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Tempat Surat</label>
                                <input name="tempat_surat" value={formData.tempat_surat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Tanggal Surat</label>
                                <div className="relative">
                                    <Flatpickr value={formData.tgl_surat} onChange={([d], s) => handleDateChange('tgl_surat', s)} options={{ locale: Indonesian, altInput: true, altFormat: "d F Y", dateFormat: "Y-m-d" }} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Data Siswa */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary"><span className="material-symbols-outlined">person</span></div>
                            <h3 className="text-white text-lg font-bold">2. Data Siswa</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Nama Siswa</label>
                                <input name="nama" value={formData.nama} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Kelas</label>
                                <input name="kelas" value={formData.kelas} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" placeholder="Misal: 7 A" />
                            </div>
                        </div>
                    </div>

                    {/* Panel 3: Jadwal Panggilan */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary"><span className="material-symbols-outlined">calendar_month</span></div>
                            <h3 className="text-white text-lg font-bold">3. Waktu & Tempat Panggilan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Hari / Tanggal</label>
                                <div className="relative">
                                    <Flatpickr
                                        value={formData.hari_tanggal}
                                        onChange={([d], s) => handleDateChange('hari_tanggal', s)}
                                        options={{
                                            locale: Indonesian,
                                            altInput: true,
                                            altFormat: "l, j F Y",
                                            dateFormat: "Y-m-d"
                                        }}
                                        className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 cursor-pointer"
                                        placeholder="Pilih Tanggal..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Waktu</label>
                                <input name="waktu" value={formData.waktu} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" placeholder="Misal: 09.00 WIB" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Tempat</label>
                                <input name="tempat" value={formData.tempat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                            </div>
                        </div>
                    </div>

                    {/* Panel 4: Pihak Sekolah (Penandatangan) */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary"><span className="material-symbols-outlined">ink_pen</span></div>
                            <h3 className="text-white text-lg font-bold">4. Penandatangan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={employeeSearchRef}>
                            <div className="space-y-2 relative">
                                <label className="text-text-secondary text-sm font-medium">Wali Kelas</label>
                                <input name="wali_kelas" value={formData.wali_kelas} onChange={(e) => handleEmployeeSearch('wali_kelas', e.target.value)} onFocus={() => { setActiveEmployeeField('wali_kelas'); setFilteredEmployees(employees); }} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                                {activeEmployeeField === 'wali_kelas' && filteredEmployees.length > 0 && (
                                    <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-50 bg-[#1c1b2e] border border-[#383663] rounded-xl shadow-2xl max-h-40 overflow-y-auto custom-scrollbar">
                                        {filteredEmployees.map(s => (
                                            <button key={s.id} type="button" onMouseDown={() => handleSelectEmployee('wali_kelas', s)} className="w-full text-left px-4 py-3 hover:bg-[#272546] border-b border-[#272546] transition-colors flex flex-col">
                                                <span className="text-white font-medium">{s.name}</span>
                                                <span className="text-xs text-[#9795c6]">{s.nip} • {s.jabatan}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">NIP Wali Kelas</label>
                                <input name="nip_wali_kelas" value={formData.nip_wali_kelas} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                            </div>
                            <div className="space-y-2 relative">
                                <label className="text-text-secondary text-sm font-medium">Koordinator BP/BK</label>
                                <input name="kordinator_bp" value={formData.kordinator_bp} onChange={(e) => handleEmployeeSearch('kordinator_bp', e.target.value)} onFocus={() => { setActiveEmployeeField('kordinator_bp'); setFilteredEmployees(employees); }} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                                {activeEmployeeField === 'kordinator_bp' && filteredEmployees.length > 0 && (
                                    <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-50 bg-[#1c1b2e] border border-[#383663] rounded-xl shadow-2xl max-h-40 overflow-y-auto custom-scrollbar">
                                        {filteredEmployees.map(s => (
                                            <button key={s.id} type="button" onMouseDown={() => handleSelectEmployee('kordinator_bp', s)} className="w-full text-left px-4 py-3 hover:bg-[#272546] border-b border-[#272546] transition-colors flex flex-col">
                                                <span className="text-white font-medium">{s.name}</span>
                                                <span className="text-xs text-[#9795c6]">{s.nip} • {s.jabatan}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">NIP Koordinator BP/BK</label>
                                <input name="nip_kordinator_bp" value={formData.nip_kordinator_bp} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                            </div>
                            <div className="space-y-2 relative">
                                <label className="text-text-secondary text-sm font-medium">Waka Kesiswaan</label>
                                <input name="waka_kesiswaan" value={formData.waka_kesiswaan} onChange={(e) => handleEmployeeSearch('waka_kesiswaan', e.target.value)} onFocus={() => { setActiveEmployeeField('waka_kesiswaan'); setFilteredEmployees(employees); }} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                                {activeEmployeeField === 'waka_kesiswaan' && filteredEmployees.length > 0 && (
                                    <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-50 bg-[#1c1b2e] border border-[#383663] rounded-xl shadow-2xl max-h-40 overflow-y-auto custom-scrollbar">
                                        {filteredEmployees.map(s => (
                                            <button key={s.id} type="button" onMouseDown={() => handleSelectEmployee('waka_kesiswaan', s)} className="w-full text-left px-4 py-3 hover:bg-[#272546] border-b border-[#272546] transition-colors flex flex-col">
                                                <span className="text-white font-medium">{s.name}</span>
                                                <span className="text-xs text-[#9795c6]">{s.nip} • {s.jabatan}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">NIP Waka Kesiswaan</label>
                                <input name="nip_waka_kesiswaan" value={formData.nip_waka_kesiswaan} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end pt-4">
                        <button type="button" onClick={() => navigate('/layanan-surat')} className="h-12 px-8 rounded-xl border border-border-dark text-text-secondary font-bold hover:text-white transition-all">Batalkan</button>
                        {!editMode && (
                            <button type="button" onClick={(e) => saveLetter(e, 'draft')} disabled={isSaving} className="h-12 px-8 rounded-xl border-2 border-amber-500 text-amber-400 hover:bg-amber-500/10 font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50">
                                <span className="material-symbols-outlined text-[20px]">draft</span> Simpan Draft
                            </button>
                        )}
                        <button type="submit" disabled={isSaving} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50">
                            {isSaving ? <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span> : <span className="material-symbols-outlined text-[20px]">save</span>}
                            {isSaving ? 'Menyimpan...' : (editMode ? 'Update Surat' : 'Simpan Surat')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ParentCallLetter;