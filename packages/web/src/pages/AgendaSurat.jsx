import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { getAgendas, addAgenda, updateAgenda, deleteAgenda } from '../services/dataService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AgendaSurat = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Top-level State
    const [letters, setLetters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTab, setFilterTab] = useState('all'); // all, incoming, outgoing
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'detail'
    const [currentLetterId, setCurrentLetterId] = useState(null);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, letterId: null, letterTitle: '' });

    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Toast State
    const [toast, setToast] = useState(null);

    // Form Data State
    const initialFormState = {
        type: 'incoming', // incoming, outgoing
        referenceNumber: '', // No Surat
        date: new Date().toISOString().split('T')[0], // Tanggal Surat
        receivedDate: new Date().toISOString().split('T')[0], // Tanggal Terima (Incoming only)
        sentDate: new Date().toISOString().split('T')[0], // Tanggal Kirim (Outgoing only)
        subject: '', // Isi Ringkas / Judul
        sender: '', // Dari (Incoming)
        recipient: '', // Kepada (Incoming/Outgoing)
        classificationCode: '',
        note: '',
        status: 'Archived', // Archived
        attachment_url: '' // Add this
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Effects ---
    useEffect(() => {
        fetchLetters();

        // Check for tab parameter in URL
        const tabParam = searchParams.get('tab');
        if (tabParam && ['all', 'incoming', 'outgoing'].includes(tabParam)) {
            setFilterTab(tabParam);
        }
    }, [searchParams]);

    // --- Data Fetching ---
    const fetchLetters = async () => {
        setLoading(true);
        try {
            const data = await getAgendas();
            setLetters(data);
        } catch (error) {
            console.error("Failed to fetch agendas:", error);
            showToast("Gagal memuat agenda surat", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- Actions ---
    const handleOpenModal = (mode, letter = null) => {
        setModalMode(mode);
        if (letter) {
            setCurrentLetterId(letter.id);
            setFormData({ ...initialFormState, ...letter });
        } else {
            setCurrentLetterId(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (modalMode === 'add') {
                await addAgenda(formData);
                showToast('Agenda surat berhasil ditambahkan', 'success');
            } else if (modalMode === 'edit') {
                await updateAgenda(currentLetterId, formData);
                showToast('Agenda surat berhasil diperbarui', 'success');
            }

            closeModal();
            fetchLetters();
        } catch (error) {
            showToast(`Gagal ${modalMode === 'add' ? 'menambahkan' : 'mengupdate'} agenda: ` + error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (letter) => {
        setDeleteModal({
            isOpen: true,
            letterId: letter.id,
            letterTitle: letter.subject
        });
    };

    const handleConfirmDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteAgenda(deleteModal.letterId);
            showToast("Agenda surat berhasil dihapus", "success");
            fetchLetters();
        } catch (error) {
            showToast("Gagal menghapus agenda: " + error.message, "error");
        } finally {
            setIsSubmitting(false);
            setDeleteModal({ isOpen: false, letterId: null, letterTitle: '' });
        }
    };

    // --- Upload Functions ---
    const parseExcelDate = (val) => {
        if (!val) return new Date().toISOString().split('T')[0];
        if (typeof val === 'number') {
            const dateObj = new Date((val - (25567 + 2)) * 86400 * 1000);
            return dateObj.toISOString().split('T')[0];
        }
        return val.toString();
    };

    const handleDownloadTemplate = async (type) => {
        const isIncoming = type === 'incoming';
        const sheetName = isIncoming ? 'Surat_Masuk' : 'Surat_Keluar';
        const fileName = isIncoming ? 'Template_Surat_Masuk.xlsx' : 'Template_Surat_Keluar.xlsx';

        const headers = isIncoming
            ? ["No. Surat", "Tanggal Surat", "Tanggal Terima", "Pengirim", "Perihal", "Klasifikasi", "Keterangan"]
            : ["No. Surat", "Tanggal Surat", "Tanggal Kirim", "Penerima", "Perihal", "Klasifikasi", "Keterangan"];

        // Fetch existing data and populate
        const existingData = letters.filter(l => l.type === type);
        const rows = [headers];

        existingData.forEach(l => {
            if (isIncoming) {
                rows.push([
                    l.referenceNumber || '',
                    l.date || '',
                    l.receivedDate || '',
                    l.sender || '',
                    l.subject || '',
                    l.classificationCode || '',
                    l.note || ''
                ]);
            } else {
                rows.push([
                    l.referenceNumber || '',
                    l.date || '',
                    l.sentDate || '',
                    l.recipient || '',
                    l.subject || '',
                    l.classificationCode || '',
                    l.note || ''
                ]);
            }
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{wch:22},{wch:15},{wch:15},{wch:22},{wch:32},{wch:15},{wch:25}];
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, fileName);
    };

    const processFile = async () => {
        if (!selectedFile) return;
        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Detect type from sheet name
                const isIncoming = firstSheetName.toLowerCase().includes('masuk');
                const type = isIncoming ? 'incoming' : 'outgoing';

                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

                if (rows.length < 2) {
                    showToast("File kosong atau tidak ada data.", "error");
                    setIsUploading(false);
                    return;
                }

                // Build a map of existing data by referenceNumber for deduplication
                const existingByRef = {};
                letters.filter(l => l.type === type).forEach(l => {
                    if (l.referenceNumber) existingByRef[l.referenceNumber] = l;
                });

                const dataRows = rows.slice(1);
                let addedCount = 0;
                let updatedCount = 0;
                let errorCount = 0;

                for (const cols of dataRows) {
                    if (!cols || cols.length === 0) continue;

                    const refNum = (cols[0] || '').toString().trim();
                    if (!refNum) continue;

                    const dateStr = parseExcelDate(cols[1]);
                    const secondDateStr = parseExcelDate(cols[2]);

                    const agendaData = {
                        referenceNumber: refNum,
                        date: dateStr,
                        type: type,
                        ...(isIncoming
                            ? { receivedDate: secondDateStr, sender: (cols[3] || '').toString() }
                            : { sentDate: secondDateStr, recipient: (cols[3] || '').toString() }
                        ),
                        subject: (cols[4] || '').toString(),
                        classificationCode: (cols[5] || '').toString(),
                        note: (cols[6] || '').toString(),
                        status: 'Archived'
                    };

                    try {
                        const existing = existingByRef[refNum];
                        if (existing) {
                            // Update existing record
                            await updateAgenda(existing.id, agendaData);
                            updatedCount++;
                        } else {
                            // Add new record
                            await addAgenda(agendaData);
                            addedCount++;
                        }
                    } catch (err) {
                        console.error("Error importing row:", cols, err);
                        errorCount++;
                    }
                }

                const parts = [];
                if (addedCount > 0) parts.push(`${addedCount} ditambahkan`);
                if (updatedCount > 0) parts.push(`${updatedCount} diperbarui`);
                if (errorCount > 0) parts.push(`${errorCount} gagal`);
                showToast(`Upload selesai: ${parts.join(', ')}`, errorCount === 0 ? 'success' : 'error');

                fetchLetters();
                setSelectedFile(null);
                setIsUploadModalOpen(false);
            } catch (error) {
                console.error("Error reading file:", error);
                showToast("Terjadi kesalahan saat membaca file Excel.", "error");
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsArrayBuffer(selectedFile);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
                setSelectedFile(file);
            } else {
                showToast("Harap upload file Excel (.xlsx, .xls) atau .csv", "error");
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
                setSelectedFile(file);
            } else {
                showToast("Harap upload file Excel (.xlsx, .xls) atau .csv", "error");
            }
        }
    };

    const closeUploadModal = () => {
        if (isUploading) return;
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- Filtering & Pagination ---
    const filteredData = letters.filter(letter => {
        const matchesSearch = (letter.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            letter.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            letter.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            letter.recipient?.toLowerCase().includes(searchTerm.toLowerCase()));

        let matchesTab = true;
        if (filterTab === 'incoming') matchesTab = letter.type === 'incoming';
        if (filterTab === 'outgoing') matchesTab = letter.type === 'outgoing';
        // 'all' shows everything

        return matchesSearch && matchesTab;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Hapus Agenda"
                message={`Apakah Anda yakin ingin menghapus agenda "${deleteModal.letterTitle}"?`}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleConfirmDelete}
                isLoading={isSubmitting}
            />

            <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 ${isModalOpen ? 'blur-sm' : ''}`}>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Agenda Surat</h1>
                </div>

                {/* Filters / Toolbar */}
                <div className="glass-panel p-4 rounded-2xl border border-[#272546]">
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">

                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-[#1c1b2e] rounded-xl border border-[#272546] w-full xl:w-auto overflow-x-auto">
                            {['all', 'incoming', 'outgoing'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterTab(tab)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterTab === tab ? 'bg-primary text-white shadow-lg' : 'text-[#9795c6] hover:text-white hover:bg-[#272546]'}`}
                                >
                                    {tab === 'all' ? 'Semua' : tab === 'incoming' ? 'Surat Masuk' : 'Surat Keluar'}
                                </button>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <span className="absolute left-3 top-2.5 text-[#9795c6] material-symbols-outlined">search</span>
                                <input
                                    className="w-full pl-10 pr-3 py-2 bg-[#1c1b2e] border border-[#272546] rounded-xl text-white focus:ring-1 focus:ring-primary focus:outline-none"
                                    placeholder="Cari agenda..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center justify-center gap-2 px-5 py-2 bg-[#272546] hover:bg-[#323055] text-white rounded-xl transition-all font-semibold">
                                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                                <span className="text-sm">Upload Data</span>
                            </button>

                            <button onClick={() => handleOpenModal('add')} className="flex items-center justify-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all font-semibold">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                <span className="text-sm font-bold">Tambah Agenda</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl border border-[#272546] overflow-hidden flex-1 flex flex-col min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-1 items-center justify-center flex-col gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <p className="text-[#9795c6]">Memuat agenda surat...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center flex-col gap-4 p-10 text-center">
                            <span className="material-symbols-outlined text-6xl text-[#272546]">menu_book</span>
                            <div className="text-[#9795c6]">Belum ada agenda surat.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-[#1c1b2e] border-b border-[#272546]">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">No.</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">Tgl. Surat</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">No. Surat</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">Asal/Tujuan</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">Perihal</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">Jenis</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#272546]">
                                    {paginatedData.map((letter, index) => (
                                        <tr key={letter.id} className="hover:bg-[#272546]/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-white font-mono">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="px-6 py-4 text-sm text-[#9795c6]">{letter.date}</td>
                                            <td className="px-6 py-4 text-sm text-white font-medium">{letter.referenceNumber}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-white">{letter.type === 'incoming' ? letter.sender : letter.recipient}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#9795c6] max-w-xs truncate" title={letter.subject}>{letter.subject}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs border ${letter.type === 'incoming'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                                    {letter.type === 'incoming' ? 'Masuk' : 'Keluar'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {/* Attachment Link Preview */}
                                                    {(letter.attachment_url) && (
                                                        <a
                                                            href={letter.attachment_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 hover:bg-teal-500/10 text-[#9795c6] hover:text-teal-400 rounded-lg transition-colors"
                                                            title="Buka Tautan Lampiran"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">link</span>
                                                        </a>
                                                    )}

                                                    <button onClick={() => handleOpenModal('edit', letter)} className="p-1.5 hover:bg-amber-500/10 text-[#9795c6] hover:text-amber-400 rounded-lg transition-colors" title="Edit">
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(letter)} className="p-1.5 hover:bg-red-500/10 text-[#9795c6] hover:text-red-400 rounded-lg transition-colors" title="Hapus">
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="px-6 py-4 border-t border-[#272546] flex justify-between items-center text-sm">
                            <span className="text-[#9795c6]">Halaman {currentPage} dari {totalPages}</span>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 bg-[#272546] text-white rounded hover:bg-[#323055] disabled:opacity-50">Prev</button>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 bg-[#272546] text-white rounded hover:bg-[#323055] disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto w-full h-full animate-in fade-in duration-300 ease-out">
                    <div className="relative bg-[#1c1b2e] border border-[#272546] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-90 duration-300 ease-out">
                        <div className="px-6 py-4 border-b border-[#272546] flex items-center justify-between flex-shrink-0">
                            <h3 className="text-xl font-bold text-white">
                                {modalMode === 'add' ? 'Tambah Agenda' : modalMode === 'edit' ? 'Edit Agenda' : 'Detail Agenda'}
                            </h3>
                            <button onClick={closeModal} className="text-[#9795c6] hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {modalMode === 'detail' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    {Object.entries(formData).map(([key, value]) => (
                                        <div key={key} className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                            <span className="text-[#9795c6] uppercase text-xs font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span className="text-white font-medium break-words">{value || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <form id="letterForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    {/* Type Selection */}
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <button type="button" onClick={() => setFormData({ ...formData, type: 'incoming' })} className={`py-2 rounded-xl text-sm font-bold border transition-all ${formData.type === 'incoming' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[#131221] border-[#272546] text-[#9795c6]'}`}>
                                            SURAT MASUK
                                        </button>
                                        <button type="button" onClick={() => setFormData({ ...formData, type: 'outgoing' })} className={`py-2 rounded-xl text-sm font-bold border transition-all ${formData.type === 'outgoing' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-[#131221] border-[#272546] text-[#9795c6]'}`}>
                                            SURAT KELUAR
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">Kode Klasifikasi</label>
                                        <input className="input-field" value={formData.classificationCode} onChange={e => setFormData({ ...formData, classificationCode: e.target.value })} placeholder="e.g. 421.2" />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">Nomor Surat</label>
                                        <input required className="input-field" value={formData.referenceNumber} onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })} placeholder="Nomor Surat Resmi" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">Tanggal Surat</label>
                                            <Flatpickr
                                                className="input-field"
                                                value={formData.date}
                                                onChange={([date]) => {
                                                    if(date) {
                                                        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                                                        setFormData({ ...formData, date: offsetDate.toISOString().split('T')[0] });
                                                    }
                                                }}
                                                options={{ dateFormat: 'Y-m-d' }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">{formData.type === 'incoming' ? 'Tanggal Terima' : 'Tanggal Kirim'}</label>
                                            <Flatpickr
                                                className="input-field"
                                                value={formData.type === 'incoming' ? formData.receivedDate : formData.sentDate}
                                                onChange={([date]) => {
                                                    if(date) {
                                                        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                                                        setFormData({ ...formData, [formData.type === 'incoming' ? 'receivedDate' : 'sentDate']: offsetDate.toISOString().split('T')[0] });
                                                    }
                                                }}
                                                options={{ dateFormat: 'Y-m-d' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">{formData.type === 'incoming' ? 'Pengirim (Dari)' : 'Penerima (Kepada)'}</label>
                                        <input required className="input-field" value={formData.type === 'incoming' ? formData.sender : formData.recipient} onChange={e => setFormData({ ...formData, [formData.type === 'incoming' ? 'sender' : 'recipient']: e.target.value })} placeholder="Nama Instansi / Orang" />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">Perihal / Isi Ringkas</label>
                                        <textarea rows="3" required className="input-field" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="Ringkasan isi surat..." />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">Keterangan</label>
                                        <textarea rows="2" className="input-field" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} placeholder="Keterangan tambahan..." />
                                    </div>

                                    {/* Digital Archive Link Section */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px]">link</span>
                                            Tautan Berkas / Google Drive (Opsional)
                                        </label>
                                        <input 
                                            type="url" 
                                            className="input-field" 
                                            value={formData.attachment_url || ''} 
                                            onChange={e => setFormData({ ...formData, attachment_url: e.target.value })} 
                                            placeholder="https://drive.google.com/..." 
                                        />
                                        <p className="text-xs text-[#4a4870]">Masukkan tautan (link) Google Drive tempat file surat disimpan.</p>
                                    </div>

                                    <style>{`
                                        .input-field {
                                            width: 100%;
                                            padding: 0.5rem 1rem;
                                            background-color: #131221;
                                            border: 1px solid #272546;
                                            border-radius: 0.5rem;
                                            color: white;
                                            font-size: 0.875rem;
                                            outline: none;
                                            transition: all 0.2s;
                                        }
                                        .input-field:focus {
                                            border-color: #6366f1;
                                            ring: 1px solid #6366f1;
                                        }
                                    `}</style>
                                </form>
                            )}
                        </div>

                        <div className="p-6 border-t border-[#272546] flex justify-end gap-3 flex-shrink-0 bg-[#1c1b2e]">
                            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-[#9795c6] hover:bg-[#272546] transition-colors font-semibold text-sm">Tutup</button>
                            {modalMode !== 'detail' && (
                                <button
                                    form="letterForm"
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto w-full h-full animate-in fade-in duration-300 ease-out">
                    <div className="relative bg-[#1c1b2e] border border-[#272546] rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col animate-in zoom-in-90 duration-300 ease-out">
                        <div className="px-6 py-4 border-b border-[#272546] flex items-center justify-between flex-shrink-0">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">upload_file</span>
                                Upload Data Agenda
                            </h3>
                            <button onClick={closeUploadModal} className="text-[#9795c6] hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                            {/* Step 1: Download Template */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-white font-bold text-base px-1">1. Unduh Template Excel</h4>
                                <p className="text-[#9795c6] text-xs px-1">Pilih jenis surat. Template akan berisi data yang sudah ada di database.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleDownloadTemplate('incoming')}
                                        className="flex items-center gap-3 p-4 bg-[#131221] rounded-xl border border-[#272546] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-emerald-400">download</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors">Surat Masuk</p>
                                            <p className="text-[#9795c6] text-[11px]">Template_Surat_Masuk.xlsx</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleDownloadTemplate('outgoing')}
                                        className="flex items-center gap-3 p-4 bg-[#131221] rounded-xl border border-[#272546] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-indigo-400">download</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white font-semibold text-sm group-hover:text-indigo-400 transition-colors">Surat Keluar</p>
                                            <p className="text-[#9795c6] text-[11px]">Template_Surat_Keluar.xlsx</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Step 2: Upload File (Drag & Drop) */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-white font-bold text-base px-1">2. Unggah File Data</h4>
                                <p className="text-[#9795c6] text-xs px-1">Jenis surat otomatis terdeteksi dari nama sheet. Data duplikat (No. Surat sama) akan diperbarui.</p>

                                <div
                                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer overflow-hidden
                                        ${selectedFile ? 'border-primary bg-primary/5' : isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-[#272546] bg-[#131221] hover:border-primary/50 hover:bg-[#1a182b]'}
                                        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                                    `}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".xlsx, .xls, .csv"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                    />

                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-[#272546] border-t-primary rounded-full animate-spin"></div>
                                            <div className="text-white font-semibold">Memproses file...</div>
                                        </div>
                                    ) : selectedFile ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[28px] text-primary">description</span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-white font-bold text-base">{selectedFile.name}</p>
                                                <p className="text-[#9795c6] text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value=''; }}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 mt-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                                Hapus file
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors
                                                ${isDragging ? 'bg-primary text-white' : 'bg-[#272546] text-[#9795c6]'}
                                            `}>
                                                <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-white font-bold text-base">Seret & lepas file Excel di sini</p>
                                                <p className="text-[#9795c6] text-xs">Atau klik untuk memilih file</p>
                                            </div>
                                            <p className="text-[10px] text-[#4a4870] font-semibold mt-1">.xlsx, .xls, .csv</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-[#272546] bg-[#1c1b2e] rounded-b-2xl flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeUploadModal}
                                className="px-5 py-2 rounded-xl text-[#9795c6] hover:bg-[#272546] hover:text-white transition-colors font-semibold text-sm"
                                disabled={isUploading}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={processFile}
                                disabled={!selectedFile || isUploading}
                                className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUploading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {isUploading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgendaSurat;
