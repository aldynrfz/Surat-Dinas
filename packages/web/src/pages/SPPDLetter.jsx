import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addLetter, updateLetter } from '../services/dataService';
import Toast from '../components/Toast';
import { useSchool } from '../contexts/SchoolContext';
import { getAllEmployees } from '../services/dataService';

// Import Flatpickr
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import { Indonesian } from "flatpickr/dist/l10n/id.js";

const SPPDLetter = () => {
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

    // Data Pegawai (Diambil dari database)
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);

    const [searchTermPPK, setSearchTermPPK] = useState('');
    const [showSuggestionsPPK, setShowSuggestionsPPK] = useState(false);
    const [filteredPPK, setFilteredPPK] = useState([]);
    const searchRefPPK = useRef(null);

    // Fetch staff on mount
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const data = await getAllEmployees();
                setStaff(data);
            } catch (error) {
                console.error("Gagal mengambil data pegawai:", error);
            }
        };
        fetchStaff();
    }, []);

    // Form Data State
    const [formData, setFormData] = useState({
        lampiran: '1 (Satu)',
        lembar: '-',
        nomor_surat: '',
        nama_pegawai: '',
        nip_pegawai: '',
        pangkat_golongan: '',
        jabatan: '',
        tingkat_biaya_perjalanan_dinas: 'Perjalanan Dinas dalam Kota',
        maksud_perjalanan_dinas: '',
        alat_angkutan: 'Kendaraan Umum', // Default Card
        tempat_berangkat: 'MTsN 11 Tasikmalaya',
        tempat_tujuan: '',
        lamanya_perjalanan: '1 (Satu) Hari',
        tanggal_berangkat: new Date().toISOString().split('T')[0],
        tanggal_kembali: new Date().toISOString().split('T')[0],

        // Field Pengikut
        pengikut_1: '',
        pengikut_1_tgl: '',
        pengikut_1_ket: '',

        instansi: 'MTsN 11 Tasikmalaya',
        mata_anggaran: 'DIPA MTsN 11 Tasikmalaya Tahun 2026',
        keterangan_lain: '-',
        tempat_surat: 'Tanjungjaya',
        tanggal_surat: new Date().toISOString().split('T')[0],

        // Field PPK
        nama_ppk: 'AI NIZAR, S.Pd.I',
        nip_ppk: '197911162009101001'
    });

    useEffect(() => {
        if (schoolData && !editMode) {
            setFormData(prev => ({
                ...prev,
                tempat_berangkat: schoolData.nama_madrasah || prev.tempat_berangkat,
                instansi: schoolData.nama_madrasah || prev.instansi,
                tempat_surat: schoolData.kecamatan || prev.tempat_surat
            }));
        }
    }, [schoolData, editMode]);

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
            if (searchRefPPK.current && !searchRefPPK.current.contains(event.target)) {
                setShowSuggestionsPPK(false);
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

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 0) {
            const filtered = staff.filter(s => s.name?.toLowerCase().includes(term.toLowerCase()) || s.nip?.includes(term));
            setFilteredStaff(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectStaff = (staff) => {
        setFormData(prev => ({
            ...prev,
            nama_pegawai: staff.name,
            nip_pegawai: staff.nip,
            pangkat_golongan: staff.pangkat,
            jabatan: staff.jabatan
        }));
        setSearchTerm(`${staff.name} - ${staff.nip}`);
        setShowSuggestions(false);
        showToast("Data pegawai berhasil dimuat", "success");
    };

    const handleSearchPPK = (e) => {
        const term = e.target.value;
        setSearchTermPPK(term);
        if (term.length > 0) {
            const filtered = staff.filter(s => s.name?.toLowerCase().includes(term.toLowerCase()) || s.nip?.includes(term));
            setFilteredPPK(filtered);
            setShowSuggestionsPPK(true);
        } else {
            setShowSuggestionsPPK(false);
        }
    };

    const handleSelectPPK = (ppk) => {
        setFormData(prev => ({
            ...prev,
            nama_ppk: ppk.name,
            nip_ppk: ppk.nip
        }));
        setSearchTermPPK(`${ppk.name} - ${ppk.nip}`);
        setShowSuggestionsPPK(false);
        showToast("Data PPK berhasil dimuat", "success");
    };

    const saveLetter = async (e, status = 'sent') => {
        e.preventDefault();

        if (!formData.nama_pegawai || !formData.nomor_surat) {
            showToast("Nama Pegawai dan Nomor Surat wajib diisi!", "error");
            return;
        }

        setIsSaving(true);
        try {
            const letterData = {
                letterType: 'sppd',
                letterNumber: formData.nomor_surat,
                subject: `SPPD - ${formData.nama_pegawai}`,
                formData: formData,
                status: status,
                date: formData.tanggal_surat,
                recipientName: formData.nama_pegawai,
                type: 'outgoing'
            };

            if (editMode && letterId) {
                await updateLetter(letterId, letterData);
                showToast("SPPD Berhasil diperbarui!", "success");
            } else {
                await addLetter(letterData);
                showToast(`SPPD Berhasil disimpan ${status === 'draft' ? 'sebagai draft' : ''}!`, "success");
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
                    <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight">Formulir SPPD</h1>
                    <p className="text-text-secondary text-base">Surat Perjalanan Dinas (SPD) Jabatan Dalam Negeri.</p>
                </div>

                {/* Auto-fill Search */}
                <div className="glass-panel p-6 rounded-2xl relative z-50" ref={searchRef}>
                    <label className="flex flex-col gap-3">
                        <span className="text-white font-semibold text-sm ml-1">Cari Nama Pegawai (Auto-fill)</span>
                        <div className="flex w-full items-stretch rounded-xl h-12 bg-[#131221] border border-[#272546] focus-within:border-primary transition-all">
                            <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                <span className="material-symbols-outlined">person_search</span>
                            </div>
                            <input className="w-full bg-transparent border-none text-white focus:outline-none px-2" placeholder="Ketik nama pegawai..." value={searchTerm} onChange={handleSearch} onFocus={() => searchTerm && setShowSuggestions(true)} />
                        </div>
                    </label>
                    {showSuggestions && (
                        <div className="absolute left-6 right-6 top-[calc(100%-10px)] z-50 bg-[#1c1b2e] border border-[#383663] rounded-b-xl shadow-2xl max-h-40 overflow-y-auto custom-scrollbar">
                            {filteredStaff.map(s => (
                                <button key={s.id} type="button" onClick={() => handleSelectStaff(s)} className="w-full text-left px-4 py-3 hover:bg-[#272546] border-b border-[#272546] transition-colors flex flex-col">
                                    <span className="text-white font-medium">{s.name}</span>
                                    <span className="text-xs text-[#9795c6]">{s.nip} • {s.jabatan}</span>
                                </button>
                            ))}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Lampiran Ke</label>
                                <input name="lampiran" value={formData.lampiran} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Lembar</label>
                                <input name="lembar" value={formData.lembar} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Nomor Surat (Kode)</label>
                                <input name="nomor_surat" value={formData.nomor_surat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 transition-all" placeholder="Misal: B-063/MTs..." required />
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Pegawai Yang Bertugas */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary"><span className="material-symbols-outlined">person</span></div>
                            <h3 className="text-white text-lg font-bold">2. Pegawai Yang Bertugas</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Nama Pegawai</label>
                                <input name="nama_pegawai" value={formData.nama_pegawai} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 transition-all" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">NIP</label>
                                <input name="nip_pegawai" value={formData.nip_pegawai} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Pangkat / Golongan</label>
                                <input name="pangkat_golongan" value={formData.pangkat_golongan} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Jabatan</label>
                                <input name="jabatan" value={formData.jabatan} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 transition-all" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Tingkat Biaya Perjalanan Dinas</label>
                                <select name="tingkat_biaya_perjalanan_dinas" value={formData.tingkat_biaya_perjalanan_dinas} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 appearance-none cursor-pointer">
                                    <option value="Perjalanan Dinas dalam Kota">Perjalanan Dinas dalam Kota</option>
                                    <option value="Tingkat A">Tingkat A</option>
                                    <option value="Tingkat B">Tingkat B</option>
                                    <option value="Tingkat C">Tingkat C</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Panel 3: Detail Perjalanan (DENGAN CARD SELECTION BARU) */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary"><span className="material-symbols-outlined">directions_car</span></div>
                            <h3 className="text-white text-lg font-bold">3. Detail Perjalanan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Maksud Perjalanan Dinas</label>
                                <textarea name="maksud_perjalanan_dinas" value={formData.maksud_perjalanan_dinas} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] min-h-[80px] p-4 resize-none transition-all" placeholder="Contoh: Koordinasi Pelaksanaan Kegiatan..."></textarea>
                            </div>

                            {/* FITUR BARU: CARD SELECTION ALAT ANGKUTAN */}
                            <div className="md:col-span-2 space-y-3 mt-2">
                                <label className="text-text-secondary text-sm font-medium">Alat Angkutan</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['Kendaraan Pribadi', 'Kendaraan Dinas', 'Kendaraan Umum'].map((jenis) => (
                                        <button
                                            key={jenis}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, alat_angkutan: jenis }))}
                                            className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-300 ${formData.alat_angkutan === jenis
                                                    ? 'bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.15)] transform scale-[1.02]'
                                                    : 'bg-[#131221] border-[#272546] text-[#9795c6] hover:border-primary/50 hover:bg-[#1c1b2e]'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-4xl mb-3">
                                                {jenis === 'Kendaraan Pribadi' ? 'directions_car' : jenis === 'Kendaraan Dinas' ? 'commute' : 'directions_bus'}
                                            </span>
                                            <span className="text-sm font-bold tracking-wide">{jenis}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 mt-2">
                                <label className="text-text-secondary text-sm font-medium">Tempat Berangkat</label>
                                <input name="tempat_berangkat" value={formData.tempat_berangkat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 transition-all" />
                            </div>
                            <div className="space-y-2 mt-2">
                                <label className="text-text-secondary text-sm font-medium">Tempat Tujuan</label>
                                <input name="tempat_tujuan" value={formData.tempat_tujuan} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 transition-all" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Lamanya Perjalanan</label>
                                <input name="lamanya_perjalanan" value={formData.lamanya_perjalanan} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 transition-all" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Tanggal Berangkat</label>
                                <div className="relative">
                                    <Flatpickr value={formData.tanggal_berangkat} onChange={([d], s) => handleDateChange('tanggal_berangkat', s)} options={{ locale: Indonesian, altInput: true, altFormat: "d F Y" }} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 cursor-pointer" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Tanggal Harus Kembali</label>
                                <div className="relative">
                                    <Flatpickr value={formData.tanggal_kembali} onChange={([d], s) => handleDateChange('tanggal_kembali', s)} options={{ locale: Indonesian, altInput: true, altFormat: "d F Y" }} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel 4: Pengikut & Anggaran */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary"><span className="material-symbols-outlined">groups</span></div>
                            <h3 className="text-white text-lg font-bold">4. Pengikut & Anggaran</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Nama Pengikut (1)</label>
                                <input name="pengikut_1" value={formData.pengikut_1} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" placeholder="Kosongkan jika tidak ada" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Tgl Lahir Pengikut</label>
                                <input name="pengikut_1_tgl" value={formData.pengikut_1_tgl} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" placeholder="Misal: 12-05-1990" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Keterangan Pengikut</label>
                                <input name="pengikut_1_ket" value={formData.pengikut_1_ket} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" placeholder="Misal: Istri / Anak" />
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Mata Anggaran</label>
                                <input name="mata_anggaran" value={formData.mata_anggaran} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Keterangan Lain-lain</label>
                                <input name="keterangan_lain" value={formData.keterangan_lain} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                            </div>
                        </div>
                    </div>

                    {/* Panel 5: Pengesahan (PPK) */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary"><span className="material-symbols-outlined">ink_pen</span></div>
                            <h3 className="text-white text-lg font-bold">5. Pengesahan (PPK)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Tempat / Kota Surat</label>
                                <input name="tempat_surat" value={formData.tempat_surat} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Tanggal Surat</label>
                                <Flatpickr value={formData.tanggal_surat} onChange={([d], s) => handleDateChange('tanggal_surat', s)} options={{ locale: Indonesian, altInput: true, altFormat: "d F Y" }} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4 cursor-pointer" />
                            </div>
                            <div className="md:col-span-2 relative z-40" ref={searchRefPPK}>
                                <label className="text-text-secondary text-sm font-medium">Cari PPK (Auto-fill)</label>
                                <div className="flex w-full items-stretch rounded-xl h-12 bg-[#131221] border border-[#272546] focus-within:border-primary transition-all mt-2">
                                    <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                        <span className="material-symbols-outlined">person_search</span>
                                    </div>
                                    <input className="w-full bg-transparent border-none text-white focus:outline-none px-2" placeholder="Ketik nama pimpinan / PPK..." value={searchTermPPK} onChange={handleSearchPPK} onFocus={() => searchTermPPK && setShowSuggestionsPPK(true)} />
                                </div>
                                {showSuggestionsPPK && (
                                    <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-50 bg-[#1c1b2e] border border-[#383663] rounded-xl shadow-2xl max-h-40 overflow-y-auto custom-scrollbar">
                                        {filteredPPK.map(s => (
                                            <button key={s.id} type="button" onClick={() => handleSelectPPK(s)} className="w-full text-left px-4 py-3 hover:bg-[#272546] border-b border-[#272546] transition-colors flex flex-col">
                                                <span className="text-white font-medium">{s.name}</span>
                                                <span className="text-xs text-[#9795c6]">{s.nip} • {s.jabatan}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">Nama PPK</label>
                                <input name="nama_ppk" value={formData.nama_ppk} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium">NIP PPK</label>
                                <input name="nip_ppk" value={formData.nip_ppk} onChange={handleInputChange} className="w-full bg-[#131221] text-white rounded-xl border border-[#272546] h-12 px-4" />
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
                            {isSaving ? 'Menyimpan...' : (editMode ? 'Update SPPD' : 'Simpan SPPD')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SPPDLetter;