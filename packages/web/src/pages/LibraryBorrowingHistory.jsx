import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import { Indonesian } from "flatpickr/dist/l10n/id.js";
import {
    getAllLibraryBorrowings,
    addLibraryBorrowing,
    returnLibraryBorrowing,
    deleteLibraryBorrowing,
    getAllLibraryBooks,
    getAllEmployees,
    getAllStudents
} from '../services/dataService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

// --- Helper Functions ---
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatPenulis = (penulis) => {
    if (!penulis) return '';
    const parts = penulis.split(',').map(p => p.trim());
    return parts.length > 1 ? `${parts[0]} lainnya` : parts[0];
};

const CATEGORY_COLORS = {
    'Elektronik': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Furniture': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Kendaraan': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Alat Tulis': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Peralatan': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'buku': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    'Lainnya': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const AddBorrowingModal = ({ isOpen, onClose, onSave, bookList, borrowers }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        nama_peminjam: '',
        nip_peminjam: '',
        tanggal_pinjam: new Date().toISOString().split('T')[0],
        keterangan: ''
    });

    // Selected books cart
    const [selectedBooks, setSelectedBooks] = useState([]);

    // Suggestion states
    const [empSearchTerm, setEmpSearchTerm] = useState('');
    const [filteredEmps, setFilteredEmps] = useState([]);
    const [showEmpSuggestions, setShowEmpSuggestions] = useState(false);

    const [bukuSearchTerm, setLibrarySearchTerm] = useState('');
    const [filteredLibrarys, setFilteredLibrarys] = useState([]);
    const [showLibrarySuggestions, setShowLibrarySuggestions] = useState(false);

    // Books available: not borrowed AND not already in current cart
    const selectedBookIds = selectedBooks.map(b => b.id);
    const availableLibrarys = bookList.filter(b => b.status !== 'dipinjam' && !selectedBookIds.includes(b.id));

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                employeeId: '', nama_peminjam: '', nip_peminjam: '',
                tanggal_pinjam: new Date().toISOString().split('T')[0],
                keterangan: ''
            });
            setSelectedBooks([]);
            setEmpSearchTerm('');
            setLibrarySearchTerm('');
        }
    }, [isOpen]);

    const handleEmpSearch = (e) => {
        const term = e.target.value;
        setEmpSearchTerm(term);
        if (term.length > 0) {
            const filtered = borrowers.filter(emp =>
                emp.name?.toLowerCase().includes(term.toLowerCase()) ||
                (emp.nip && emp.nip.includes(term)) ||
                (emp.nisn && emp.nisn.includes(term))
            );
            setFilteredEmps(filtered);
            setShowEmpSuggestions(true);
        } else {
            setShowEmpSuggestions(false);
        }
    };

    const handleSelectEmp = (emp) => {
        setFormData(prev => ({
            ...prev,
            employeeId: emp.id,
            nama_peminjam: emp.name,
            nip_peminjam: emp.nip || emp.nisn || '-'
        }));
        setEmpSearchTerm(`${emp.name} - ${emp.nip || emp.nisn || '-'}`);
        setShowEmpSuggestions(false);
    };

    const handleLibrarySearch = (e) => {
        const term = e.target.value;
        const lowerTerm = term.toLowerCase();
        setLibrarySearchTerm(term);
        if (term.length > 0) {
            const filtered = availableLibrarys.filter(buku =>
                (buku.judul_buku?.toLowerCase() || '').includes(lowerTerm) ||
                (buku.kode_buku || '').toLowerCase().includes(lowerTerm) ||
                (buku.penulis?.toLowerCase() || '').includes(lowerTerm) ||
                (buku.tahun?.toString() || '').includes(lowerTerm)
            );
            setFilteredLibrarys(filtered);
            setShowLibrarySuggestions(true);
        } else {
            setShowLibrarySuggestions(false);
        }
    };

    const handleSelectLibrary = (buku) => {
        setSelectedBooks(prev => [...prev, buku]);
        setLibrarySearchTerm('');
        setShowLibrarySuggestions(false);
    };

    const handleRemoveBook = (bookId) => {
        setSelectedBooks(prev => prev.filter(b => b.id !== bookId));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nama_peminjam) {
            alert('Mohon lengkapi nama peminjam');
            return;
        }
        if (selectedBooks.length === 0) {
            alert('Mohon pilih minimal satu buku untuk dipinjam');
            return;
        }
        onSave({
            ...formData,
            selectedBooks,
            status: 'dipinjam',
            tanggal_kembali: null
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-[#1c1b2e] border border-white/10 rounded-2xl shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Tambah Peminjaman Buku Perpustakaan</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    {/* Pencarian Peminjam */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Cari Peminjam (Siswa / Pegawai)</label>
                        <input
                            type="text"
                            value={empSearchTerm}
                            onChange={handleEmpSearch}
                            placeholder="Ketik nama, NIP, atau NISN..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                        />
                        {showEmpSuggestions && filteredEmps.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-[#272546] border border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                {filteredEmps.map(emp => (
                                    <li key={emp.id} onClick={() => handleSelectEmp(emp)} className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-slate-200">
                                        {emp.name} ({emp.nip || emp.nisn || '-'})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Pencarian & Tambah Buku */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Cari & Tambah Buku (yang Tersedia)
                            {selectedBooks.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold">
                                    {selectedBooks.length} dipilih
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={bukuSearchTerm}
                            onChange={handleLibrarySearch}
                            placeholder="Ketik kode, judul, atau penulis buku..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                        />
                        {showLibrarySuggestions && filteredLibrarys.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-[#272546] border border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                {filteredLibrarys.map(buku => (
                                    <li key={buku.id} onClick={() => handleSelectLibrary(buku)} className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-slate-200 flex flex-col">
                                        <span className="font-medium">{buku.judul_buku} {buku.penulis ? `(${formatPenulis(buku.penulis)})` : ''}</span>
                                        <span className="text-xs text-slate-400">
                                            Kode: {buku.kode_buku} | Kategori: {buku.kategori || buku.jenis || '-'}
                                            {buku.jenis === 'Buku Paket Mapel' && buku.peruntukan ? ` (${buku.peruntukan})` : ''} | Tahun: {buku.tahun || '-'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {showLibrarySuggestions && bukuSearchTerm.length > 0 && filteredLibrarys.length === 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-[#272546] border border-white/10 rounded-xl shadow-lg p-3 text-sm text-slate-400">
                                Buku tidak ditemukan atau sedang dipinjam.
                            </div>
                        )}
                    </div>

                    {/* Daftar Buku yang Dipilih */}
                    {selectedBooks.length > 0 && (
                        <div className="border border-white/10 rounded-xl overflow-hidden">
                            <div className="bg-white/5 px-4 py-2 text-xs font-semibold text-slate-400 flex items-center justify-between">
                                <span>Daftar Buku Dipinjam</span>
                                <span className="text-indigo-400">{selectedBooks.length} buku</span>
                            </div>
                            <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                                {selectedBooks.map((buku, idx) => (
                                    <div key={buku.id} className="flex items-center gap-3 px-4 py-2.5 group hover:bg-white/5 transition-colors">
                                        <span className="text-xs text-slate-500 w-5 text-center">{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium truncate">{buku.judul_buku}</p>
                                            <p className="text-xs text-slate-400 truncate">
                                                {buku.kode_buku} • {formatPenulis(buku.penulis) || '-'} • {buku.kategori || buku.jenis || '-'}
                                                {buku.jenis === 'Buku Paket Mapel' && buku.peruntukan ? ` • ${buku.peruntukan}` : ''}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBook(buku.id)}
                                            className="p-1 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex-shrink-0"
                                            title="Hapus dari daftar"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tanggal Pinjam */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal Pinjam</label>
                        <Flatpickr
                            value={formData.tanggal_pinjam}
                            onChange={([date], str) => setFormData(prev => ({ ...prev, tanggal_pinjam: str }))}
                            options={{ locale: Indonesian, altInput: true, altFormat: "d F Y", dateFormat: "Y-m-d" }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white cursor-pointer"
                        />
                    </div>

                    {/* Keterangan */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Keterangan (Opsional)</label>
                        <textarea
                            value={formData.keterangan}
                            onChange={e => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white h-20 resize-none"
                            placeholder="Catatan tambahan..."
                        ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">save</span>
                            Simpan {selectedBooks.length > 0 ? `(${selectedBooks.length} buku)` : ''}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};



// --- Modal Return ---
const ReturnModal = ({ isOpen, onClose, onConfirm, item }) => {
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen || !item) return null;
    const books = item.bookItems || (item.bookItem ? [item.bookItem] : []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[#1c1b2e] border border-white/10 rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Kembalikan Buku</h3>
                <p className="text-sm text-slate-300 mb-3">
                    Konfirmasi pengembalian <strong>{books.length} buku</strong> dari <strong>{item.nama_peminjam}</strong>:
                </p>
                <div className="bg-white/5 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto space-y-1.5">
                    {books.map((b, i) => (
                        <p key={i} className="text-sm text-slate-300"><span className="text-slate-500">{i + 1}.</span> {b.judul_buku}</p>
                    ))}
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal Kembali</label>
                    <Flatpickr
                        value={returnDate}
                        onChange={([date], str) => setReturnDate(str)}
                        options={{ locale: Indonesian, altInput: true, altFormat: "d F Y", dateFormat: "Y-m-d" }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white cursor-pointer"
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5">Batal</button>
                    <button onClick={() => onConfirm(returnDate)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/25">Konfirmasi</button>
                </div>
            </div>
        </div>
    );
};

// --- Preview Modal ---
const PreviewModal = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;
    const books = item.bookItems || (item.bookItem ? [item.bookItem] : []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#1c1b2e] border border-white/10 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Detail Peminjaman</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500">Peminjam</p>
                            <p className="text-white font-medium">{item.nama_peminjam}</p>
                            <p className="text-xs text-slate-400">NIP/NISN: {item.nip_peminjam}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Status</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${item.status === 'dipinjam' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {item.status === 'dipinjam' ? 'Dipinjam' : 'Dikembalikan'}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Tanggal Pinjam</p>
                            <p className="text-white font-medium">{formatDate(item.tanggal_pinjam)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Tanggal Kembali</p>
                            <p className="text-white font-medium">{formatDate(item.tanggal_kembali)}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-slate-500">Jumlah Buku</p>
                            <p className="text-white font-bold text-lg">{books.length} <span className="text-sm font-normal text-slate-400">buku</span></p>
                        </div>
                        <div className="col-span-2 border-t border-white/5 pt-4">
                            <p className="text-xs text-slate-500 mb-2">Daftar Buku ({books.length})</p>
                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                {books.map((b, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded-lg text-sm text-slate-300">
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs text-slate-500 mt-0.5">{i + 1}.</span>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{b.judul_buku}</p>
                                                <p><span className="text-slate-500">Kode:</span> {b.kode_buku}</p>
                                                <p><span className="text-slate-500">Penulis:</span> {formatPenulis(b.penulis) || '-'}</p>
                                                <p><span className="text-slate-500">Kategori:</span> {b.kategori || b.jenis || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 pt-0 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl">Tutup</button>
                </div>
            </div>
        </div>
    );
};

// --- Export Modal ---
const ExportModal = ({ isOpen, onClose, onExport }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setStartDate('');
            setEndDate('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-sm bg-[#1c1b2e] border border-white/10 rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Unduh Data Peminjaman</h3>
                <p className="text-sm text-slate-300 mb-4">Pilih rentang waktu peminjaman untuk diekspor (kosongkan untuk unduh semua).</p>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Dari Tanggal</label>
                        <Flatpickr
                            value={startDate}
                            onChange={([date], str) => setStartDate(str)}
                            options={{ locale: Indonesian, altInput: true, altFormat: "d F Y", dateFormat: "Y-m-d" }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white cursor-pointer"
                            placeholder="Mulai..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Sampai Tanggal</label>
                        <Flatpickr
                            value={endDate}
                            onChange={([date], str) => setEndDate(str)}
                            options={{ locale: Indonesian, altInput: true, altFormat: "d F Y", dateFormat: "Y-m-d" }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white cursor-pointer"
                            placeholder="Selesai..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors">Batal</button>
                    <button onClick={() => onExport(startDate, endDate)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/25 transition-colors">
                        <span className="material-symbols-outlined text-sm">download</span>Unduh
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const LibraryBorrowingHistory = () => {
    const navigate = useNavigate();
    const [borrowings, setBorrowings] = useState([]);
    const [bookList, setLibraryList] = useState([]);
    const [borrowers, setBorrowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [returnModal, setReturnModal] = useState({ isOpen: false, item: null });
    const [previewModal, setPreviewModal] = useState({ isOpen: false, item: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null, bookId: null, status: '' });
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Date range filter for Table Display
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStartDate, filterEndDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [borrowData, bukuData, empData, studentData] = await Promise.all([
                getAllLibraryBorrowings(),
                getAllLibraryBooks(),
                getAllEmployees(),
                getAllStudents()
            ]);
            setBorrowings(borrowData);
            setLibraryList(bukuData);
            setBorrowers([...empData, ...studentData]);
        } catch (error) {
            showToast('Gagal memuat data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveBorrowing = async (formData) => {
        try {
            const { selectedBooks, ...rest } = formData;
            // Create a single borrowing record with multiple bookIds/bookItems
            const borrowingPayload = {
                ...rest,
                bookIds: selectedBooks.map(b => b.id),
                bookItems: selectedBooks,
                jumlah: selectedBooks.length,
            };
            await addLibraryBorrowing(borrowingPayload);
            showToast(`${selectedBooks.length} buku berhasil dipinjamkan`, 'success');
            setIsAddModalOpen(false);
            fetchData();
        } catch (error) {
            showToast('Gagal menyimpan peminjaman', 'error');
        }
    };

    const handleConfirmReturn = async (date) => {
        try {
            const item = returnModal.item;
            const bookIds = item.bookIds || (item.bookId ? [item.bookId] : []);
            await returnLibraryBorrowing(item.id, bookIds, date);
            showToast('Buku berhasil dikembalikan', 'success');
            setReturnModal({ isOpen: false, item: null });
            fetchData();
        } catch (error) {
            showToast('Gagal mengembalikan buku', 'error');
        }
    };

    const handleConfirmDelete = async () => {
        try {
            const bookIds = deleteModal.bookIds || (deleteModal.bookId ? [deleteModal.bookId] : []);
            await deleteLibraryBorrowing(deleteModal.itemId, bookIds, deleteModal.status);
            showToast('Riwayat berhasil dihapus', 'success');
            setDeleteModal({ isOpen: false, itemId: null, bookIds: [], status: '' });
            fetchData();
        } catch (error) {
            showToast('Gagal menghapus riwayat', 'error');
        }
    };

    const handleExportExcel = (exportStartDate, exportEndDate) => {
        let exportData = borrowings;

        // Filter by date range if provided
        if (exportStartDate && exportEndDate) {
            exportData = borrowings.filter(item => {
                const pinjam = new Date(item.tanggal_pinjam);
                return pinjam >= new Date(exportStartDate) && pinjam <= new Date(exportEndDate);
            });
        }

        const headers = ['No', 'Nama Peminjam', 'Jumlah Buku', 'Daftar Buku', 'Tanggal Pinjam', 'Tanggal Kembali', 'Status'];
        const rows = exportData.map((item, index) => {
            const books = item.bookItems || (item.bookItem ? [item.bookItem] : []);
            const bookListStr = books.map(b => `${b.judul_buku} (${b.kode_buku})`).join('; ');
            return `"${index + 1}","${item.nama_peminjam}","${books.length}","${bookListStr}","${item.tanggal_pinjam || ''}","${item.tanggal_kembali || ''}","${item.status}"`;
        });

        const uri = encodeURI('data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.join('\n'));
        const a = document.createElement('a');
        a.href = uri;
        a.download = `Riwayat_Peminjaman_Perpustakaan${exportStartDate ? `_${exportStartDate}_to_${exportEndDate}` : ''}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsExportModalOpen(false);
        showToast('Data berhasil diunduh sebagai CSV', 'success');
    };

    const filteredBorrowings = borrowings.filter(item => {
        const q = searchTerm.toLowerCase();
        const books = item.bookItems || (item.bookItem ? [item.bookItem] : []);

        const matchesSearch = (item.nama_peminjam?.toLowerCase() || '').includes(q) ||
            books.some(b =>
                (b.judul_buku?.toLowerCase() || '').includes(q) ||
                (b.kode_buku?.toLowerCase() || '').includes(q) ||
                (b.penulis?.toLowerCase() || '').includes(q) ||
                (b.tahun?.toString() || '').includes(q)
            );

        let matchesDate = true;
        if (filterStartDate && filterEndDate) {
            const pinjam = new Date(item.tanggal_pinjam);
            matchesDate = pinjam >= new Date(filterStartDate) && pinjam <= new Date(filterEndDate);
        }

        return matchesSearch && matchesDate;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBorrowings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBorrowings.length / itemsPerPage);

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                <ConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, itemId: null, bookId: null, status: '' })}
                    onConfirm={handleConfirmDelete}
                    title="Hapus Riwayat"
                    message="Apakah Anda yakin ingin menghapus riwayat peminjaman ini?"
                />

                <AddBorrowingModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveBorrowing}
                    bookList={bookList}
                    borrowers={borrowers}
                />

                <ReturnModal
                    isOpen={returnModal.isOpen}
                    onClose={() => setReturnModal({ isOpen: false, item: null })}
                    onConfirm={handleConfirmReturn}
                    item={returnModal.item}
                />

                <PreviewModal
                    isOpen={previewModal.isOpen}
                    onClose={() => setPreviewModal({ isOpen: false, item: null })}
                    item={previewModal.item}
                />

                <ExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    onExport={handleExportExcel}
                />

                {/* Breadcrumb */}
                <div className="flex flex-col gap-3">

                    <div>
                        <h1 className="text-3xl font-bold text-white">Peminjaman</h1>
                        <p className="text-slate-400 mt-1">Kelola daftar peminjaman dan pengembalian buku</p>
                    </div>
                </div>

                {/* Top Bar */}
                <div className="glass-panel p-5 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Cari peminjam, buku..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        {/* Date Range Filters for Display Sort */}
                        <div className="flex items-center gap-2">
                            <Flatpickr
                                value={filterStartDate}
                                onChange={([d], s) => setFilterStartDate(s)}
                                options={{ dateFormat: "Y-m-d" }}
                                placeholder="Dari tgl"
                                className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-slate-500">-</span>
                            <Flatpickr
                                value={filterEndDate}
                                onChange={([d], s) => setFilterEndDate(s)}
                                options={{ dateFormat: "Y-m-d" }}
                                placeholder="S/d tgl"
                                className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
                        <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50 rounded-xl transition-all">
                            <span className="material-symbols-outlined text-sm">download</span>Unduh Excel
                        </button>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25">
                            <span className="material-symbols-outlined text-sm">add</span>Tambah Peminjam
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-slate-300 text-sm">
                                    <th className="p-4 font-medium w-14 text-center">No</th>
                                    <th className="p-4 font-medium">Nama Peminjam</th>
                                    <th className="p-4 font-medium">Buku Dipinjam</th>
                                    <th className="p-4 font-medium text-center">Jumlah</th>
                                    <th className="p-4 font-medium">Tgl Pinjam</th>
                                    <th className="p-4 font-medium">Tgl Kembali</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {loading ? (
                                    <tr><td colSpan="8" className="p-8 text-center text-slate-400">Memuat data...</td></tr>
                                ) : currentItems.length === 0 ? (
                                    <tr><td colSpan="8" className="p-8 text-center text-slate-400">Belum ada riwayat peminjaman</td></tr>
                                ) : (
                                    currentItems.map((item, index) => {
                                        const books = item.bookItems || (item.bookItem ? [item.bookItem] : []);
                                        const firstBook = books[0] || {};
                                        return (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 text-center text-slate-400">{indexOfFirstItem + index + 1}</td>
                                                <td className="p-4">
                                                    <p className="text-white font-medium">{item.nama_peminjam}</p>
                                                    <p className="text-xs text-slate-400">{item.nip_peminjam}</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-white font-medium">{firstBook.judul_buku || '-'}</p>
                                                    <p className="text-xs text-slate-400">{firstBook.kode_buku || ''} {firstBook.penulis ? `• ${formatPenulis(firstBook.penulis)}` : ''} • {firstBook.kategori || firstBook.jenis || '-'}</p>
                                                    {books.length > 1 && (
                                                        <p className="text-xs text-indigo-400 mt-0.5">+{books.length - 1} buku lainnya</p>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-indigo-500/15 text-indigo-400 rounded-lg text-sm font-bold">
                                                        {books.length}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-300">{formatDate(item.tanggal_pinjam)}</td>
                                                <td className="p-4 text-slate-300">{formatDate(item.tanggal_kembali)}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'dipinjam' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'dipinjam' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                                        {item.status === 'dipinjam' ? 'Dipinjam' : 'Dikembalikan'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-1.5 transition-opacity">
                                                        <button onClick={() => setPreviewModal({ isOpen: true, item })} className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors" title="Detail">
                                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                        </button>
                                                        {item.status === 'dipinjam' && (
                                                            <button onClick={() => setReturnModal({ isOpen: true, item })} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors" title="Kembalikan">
                                                                <span className="material-symbols-outlined text-[18px]">assignment_return</span>
                                                            </button>
                                                        )}
                                                        <button onClick={() => setDeleteModal({ isOpen: true, itemId: item.id, bookIds: item.bookIds || (item.bookId ? [item.bookId] : []), status: item.status })} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Hapus">
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && filteredBorrowings.length > 0 && (
                        <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm flex-col sm:flex-row gap-4">
                            <div className="text-slate-400">
                                Menampilkan <span className="text-white font-medium">{indexOfFirstItem + 1}</span>–<span className="text-white font-medium">{Math.min(indexOfLastItem, filteredBorrowings.length)}</span> dari <span className="text-white font-medium">{filteredBorrowings.length}</span> data
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                </button>
                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, i) => {
                                        if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage)) {
                                            return (
                                                <button key={i} onClick={() => setCurrentPage(i + 1)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-sm ${currentPage === i + 1 ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                                                    {i + 1}
                                                </button>
                                            );
                                        } else if (i === currentPage - 3 || i === currentPage + 1) {
                                            return <span key={i} className="text-slate-500 flex items-end">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LibraryBorrowingHistory;
