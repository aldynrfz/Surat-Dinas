import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { getAgendas, addAgenda, updateAgenda, deleteAgenda } from '../services/dataService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
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

    // Toast State
    const [toast, setToast] = useState(null);

    // Form Data State
    const initialFormState = {
        type: 'incoming', // incoming, outgoing
        agendaNumber: '',
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

    // --- Digital Attachment (Link) logic handled directly in state ---

    // --- CSV Export ---
    const handleExportCSV = () => {
        const headers = ["Agenda", "No. Surat", "Tanggal", "Jenis", "Pengirim", "Penerima", "Perihal", "Klasifikasi", "Keterangan"];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + filteredData.map(l => {
                return [
                    `"${l.agendaNumber || ''}"`,
                    `"${l.referenceNumber || ''}"`,
                    `"${l.date || ''}"`,
                    `"${l.type === 'incoming' ? 'Masuk' : 'Keluar'}"`,
                    `"${l.sender || ''}"`,
                    `"${l.recipient || ''}"`,
                    `"${l.subject || ''}"`,
                    `"${l.classificationCode || ''}"`,
                    `"${l.note || ''}"`
                ].join(",");
            }).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `agenda_surat_${filterTab}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- CSV Import ---
    const handleImportCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split('\n').slice(1); // Skip header

            let successCount = 0;
            let errorCount = 0;

            for (const row of rows) {
                if (!row.trim()) continue;

                // Simple CSV parser (doesn't handle commas within quotes perfectly, but sufficient for simple data)
                // For robust parsing, we should use a library like PapaParse
                const cols = row.split(',').map(c => c.replace(/^"|"$/g, '').trim());

                if (cols.length < 5) continue;

                const newAgenda = {
                    agendaNumber: cols[0] || '',
                    referenceNumber: cols[1] || '',
                    date: cols[2] || new Date().toISOString().split('T')[0],
                    type: cols[3]?.toLowerCase() === 'keluar' ? 'outgoing' : 'incoming',
                    sender: cols[4] || '',
                    recipient: cols[5] || '',
                    subject: cols[6] || '',
                    classificationCode: cols[7] || '',
                    note: cols[8] || '',
                    status: 'Archived'
                };

                try {
                    await addAgenda(newAgenda);
                    successCount++;
                } catch (err) {
                    console.error("Error importing row:", row, err);
                    errorCount++;
                }
            }

            fetchLetters();
            showToast(`Import selesai: ${successCount} berhasil, ${errorCount} gagal`, successCount > 0 ? "success" : "error");
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };


    // --- Filtering & Pagination ---
    const filteredData = letters.filter(letter => {
        const matchesSearch = (letter.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            letter.agendaNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

                            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#272546] hover:bg-[#323055] text-white rounded-xl transition-colors cursor-pointer">
                                <span className="material-symbols-outlined text-[20px]">upload</span>
                                <span className="text-sm font-semibold">Import</span>
                                <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                            </label>

                            <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 px-4 py-2 bg-[#272546] hover:bg-[#323055] text-white rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-[20px]">download</span>
                                <span className="text-sm font-semibold">Export</span>
                            </button>

                            <button onClick={() => handleOpenModal('add')} className="flex items-center justify-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all">
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
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">Agenda</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">Tgl. Surat</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">No. Surat</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">Asal/Tujuan</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">Perihal</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">Jenis</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#272546]">
                                    {paginatedData.map((letter) => (
                                        <tr key={letter.id} className="hover:bg-[#272546]/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-white font-mono">{letter.agendaNumber}</td>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto w-full h-full">
                    <div className="relative bg-[#1c1b2e] border border-[#272546] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">No. Agenda</label>
                                            <input required className="input-field" value={formData.agendaNumber} onChange={e => setFormData({ ...formData, agendaNumber: e.target.value })} placeholder="001/2024" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">Kode Klasifikasi</label>
                                            <input className="input-field" value={formData.classificationCode} onChange={e => setFormData({ ...formData, classificationCode: e.target.value })} placeholder="e.g. 421.2" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">Nomor Surat</label>
                                        <input required className="input-field" value={formData.referenceNumber} onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })} placeholder="Nomor Surat Resmi" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">Tanggal Surat</label>
                                            <input type="date" className="input-field" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">{formData.type === 'incoming' ? 'Tanggal Terima' : 'Tanggal Kirim'}</label>
                                            <input type="date" className="input-field" value={formData.type === 'incoming' ? formData.receivedDate : formData.sentDate} onChange={e => setFormData({ ...formData, [formData.type === 'incoming' ? 'receivedDate' : 'sentDate']: e.target.value })} />
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
        </div>
    );
};

export default AgendaSurat;
