import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import { Indonesian } from "flatpickr/dist/l10n/id.js";
import {
    getAllBmnBorrowings,
    addBmnBorrowing,
    returnBmnBorrowing,
    deleteBmnBorrowing,
    getAllBMN,
    getAllEmployees
} from '../services/dataService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

// --- Helper Functions ---
const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    } catch {
        return dateStr;
    }
};

const CATEGORY_COLORS = {
    'Elektronik': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Furniture': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Kendaraan': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Alat Tulis': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Peralatan': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Buku': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    'Lainnya': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

// --- Modal Tambah Peminjam ---
const AddBorrowingModal = ({ isOpen, onClose, onSave, bmnList, employees }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        nama_peminjam: '',
        nip_peminjam: '',
        bmnId: '',
        bmnItem: null,
        tanggal_pinjam: new Date().toISOString().split('T')[0],
        keterangan: ''
    });

    // Suggestion states
    const [empSearchTerm, setEmpSearchTerm] = useState('');
    const [filteredEmps, setFilteredEmps] = useState([]);
    const [showEmpSuggestions, setShowEmpSuggestions] = useState(false);

    const [bmnSearchTerm, setBmnSearchTerm] = useState('');
    const [filteredBmns, setFilteredBmns] = useState([]);
    const [showBmnSuggestions, setShowBmnSuggestions] = useState(false);

    const availableBmns = bmnList.filter(b => b.status !== 'dipinjam');

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                employeeId: '', nama_peminjam: '', nip_peminjam: '',
                bmnId: '', bmnItem: null,
                tanggal_pinjam: new Date().toISOString().split('T')[0],
                keterangan: ''
            });
            setEmpSearchTerm('');
            setBmnSearchTerm('');
        }
    }, [isOpen]);

    const handleEmpSearch = (e) => {
        const term = e.target.value;
        setEmpSearchTerm(term);
        if (term.length > 0) {
            const filtered = employees.filter(emp =>
                emp.name?.toLowerCase().includes(term.toLowerCase()) ||
                emp.nip?.includes(term)
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
            nip_peminjam: emp.nip
        }));
        setEmpSearchTerm(`${emp.name} - ${emp.nip}`);
        setShowEmpSuggestions(false);
    };

    const handleBmnSearch = (e) => {
        const term = e.target.value;
        const lowerTerm = term.toLowerCase();
        setBmnSearchTerm(term);
        if (term.length > 0) {
            const filtered = availableBmns.filter(bmn =>
                (bmn.nama_barang?.toLowerCase() || '').includes(lowerTerm) ||
                (bmn.kode_barang || '').toLowerCase().includes(lowerTerm) ||
                (bmn.merk_type?.toLowerCase() || '').includes(lowerTerm) ||
                (bmn.tahun_pengadaan?.toString() || '').includes(lowerTerm)
            );
            setFilteredBmns(filtered);
            setShowBmnSuggestions(true);
        } else {
            setShowBmnSuggestions(false);
        }
    };

    const handleSelectBmn = (bmn) => {
        setFormData(prev => ({
            ...prev,
            bmnId: bmn.id,
            bmnItem: bmn
        }));
        setBmnSearchTerm(`${bmn.kode_barang} - ${bmn.nama_barang}`);
        setShowBmnSuggestions(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nama_peminjam || !formData.bmnItem) {
            alert('Mohon lengkapi nama peminjam dan pilih barang');
            return;
        }
        onSave({
            ...formData,
            status: 'dipinjam',
            tanggal_kembali: null
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#1c1b2e] border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Tambah Peminjaman BMN</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Pencarian Peminjam */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Cari Peminjam (Pegawai)</label>
                        <input
                            type="text"
                            value={empSearchTerm}
                            onChange={handleEmpSearch}
                            placeholder="Ketik nama atau NIP..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                        />
                        {showEmpSuggestions && filteredEmps.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-[#272546] border border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                {filteredEmps.map(emp => (
                                    <li key={emp.id} onClick={() => handleSelectEmp(emp)} className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-slate-200">
                                        {emp.name} ({emp.nip})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Pencarian BMN */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Cari Barang (yang Tersedia)</label>
                        <input
                            type="text"
                            value={bmnSearchTerm}
                            onChange={handleBmnSearch}
                            placeholder="Ketik kode atau nama barang..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                        />
                        {showBmnSuggestions && filteredBmns.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-[#272546] border border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                {filteredBmns.map(bmn => (
                                    <li key={bmn.id} onClick={() => handleSelectBmn(bmn)} className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-slate-200 flex flex-col">
                                        <span className="font-medium">{bmn.nama_barang} {bmn.merk_type ? `(${bmn.merk_type})` : ''}</span>
                                        <span className="text-xs text-slate-400">Kode: {bmn.kode_barang} | Kategori: {bmn.kategori} | Tahun: {bmn.tahun_pengadaan || '-'}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {showBmnSuggestions && filteredBmns.length === 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-[#272546] border border-white/10 rounded-xl shadow-lg p-3 text-sm text-slate-400">
                                Barang tidak ditemukan atau sedang dipinjam.
                            </div>
                        )}
                    </div>

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
                        <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/25">Simpan Peminjaman</button>
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-sm bg-[#1c1b2e] border border-white/10 rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Kembalikan Barang</h3>
                <p className="text-sm text-slate-300 mb-4">
                    Konfirmasi pengembalian <strong>{item.bmnItem?.nama_barang}</strong> dari <strong>{item.nama_peminjam}</strong>.
                </p>
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
    const bmn = item.bmnItem || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#1c1b2e] border border-white/10 rounded-2xl shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Detail Peminjaman</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500">Peminjam</p>
                            <p className="text-white font-medium">{item.nama_peminjam}</p>
                            <p className="text-xs text-slate-400">NIP: {item.nip_peminjam}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Status</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${item.status === 'dipinjam' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {item.status === 'dipinjam' ? 'Dipinjam' : 'Tersedia'}
                            </span>
                        </div>
                        <div className="col-span-2 border-t border-white/5 pt-4">
                            <p className="text-xs text-slate-500 mb-2">Detail Barang</p>
                            <div className="bg-white/5 p-3 rounded-lg text-sm text-slate-300">
                                <p><span className="text-slate-500">Kode:</span> {bmn.kode_barang}</p>
                                <p><span className="text-slate-500">Nama:</span> {bmn.nama_barang}</p>
                                <p><span className="text-slate-500">Kategori:</span> {bmn.kategori}</p>
                                <p><span className="text-slate-500">Merk/Type:</span> {bmn.merk_type}</p>
                                <p><span className="text-slate-500">Warna:</span> {bmn.warna}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Tanggal Pinjam</p>
                            <p className="text-white font-medium">{formatDate(item.tanggal_pinjam)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Tanggal Kembali</p>
                            <p className="text-white font-medium">{formatDate(item.tanggal_kembali)}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 pt-0 flex justify-end">
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
const BmnBorrowingHistory = () => {
    const navigate = useNavigate();
    const [borrowings, setBorrowings] = useState([]);
    const [bmnList, setBmnList] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [returnModal, setReturnModal] = useState({ isOpen: false, item: null });
    const [previewModal, setPreviewModal] = useState({ isOpen: false, item: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null, bmnId: null, status: '' });
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
            const [borrowData, bmnData, empData] = await Promise.all([
                getAllBmnBorrowings(),
                getAllBMN(),
                getAllEmployees()
            ]);
            setBorrowings(borrowData);
            setBmnList(bmnData);
            setEmployees(empData);
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
            await addBmnBorrowing(formData);
            showToast('Peminjaman berhasil disimpan', 'success');
            setIsAddModalOpen(false);
            fetchData();
        } catch (error) {
            showToast('Gagal menyimpan peminjaman', 'error');
        }
    };

    const handleConfirmReturn = async (date) => {
        try {
            await returnBmnBorrowing(returnModal.item.id, returnModal.item.bmnId, date);
            showToast('Barang berhasil dikembalikan', 'success');
            setReturnModal({ isOpen: false, item: null });
            fetchData();
        } catch (error) {
            showToast('Gagal mengembalikan barang', 'error');
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteBmnBorrowing(deleteModal.itemId, deleteModal.bmnId, deleteModal.status);
            showToast('Riwayat berhasil dihapus', 'success');
            setDeleteModal({ isOpen: false, itemId: null, bmnId: null, status: '' });
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

        const headers = ['No', 'Nama Peminjam', 'Kode Barang', 'Jenis/Nama Barang', 'Merk/Type', 'Warna', 'Kategori', 'Tahun Perolehan', 'Jumlah', 'Tanggal Pinjam', 'Tanggal Kembali', 'Status'];
        const rows = exportData.map((item, index) => {
            const b = item.bmnItem || {};
            return `"${index + 1}","${item.nama_peminjam}","${b.kode_barang || ''}","${b.nama_barang || ''}","${b.merk_type || ''}","${b.warna || ''}","${b.kategori || ''}","${b.tahun_pengadaan || ''}","${b.jumlah || ''}","${item.tanggal_pinjam || ''}","${item.tanggal_kembali || ''}","${item.status}"`;
        });
        
        const uri = encodeURI('data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.join('\n'));
        const a = document.createElement('a');
        a.href = uri;
        a.download = `Riwayat_Peminjaman_BMN${exportStartDate ? `_${exportStartDate}_to_${exportEndDate}` : ''}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsExportModalOpen(false);
        showToast('Data berhasil diunduh sebagai CSV', 'success');
    };

    const filteredBorrowings = borrowings.filter(item => {
        const q = searchTerm.toLowerCase();
        const b = item.bmnItem || {};
        
        const matchesSearch = (item.nama_peminjam?.toLowerCase() || '').includes(q) ||
            (b.nama_barang?.toLowerCase() || '').includes(q) ||
            (b.kode_barang?.toLowerCase() || '').includes(q) ||
            (b.merk_type?.toLowerCase() || '').includes(q) ||
            (b.tahun_pengadaan?.toString() || '').includes(q);

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
                    onClose={() => setDeleteModal({ isOpen: false, itemId: null, bmnId: null, status: '' })}
                    onConfirm={handleConfirmDelete}
                    title="Hapus Riwayat"
                    message="Apakah Anda yakin ingin menghapus riwayat peminjaman ini?"
                />

                <AddBorrowingModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveBorrowing}
                    bmnList={bmnList}
                    employees={employees}
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
                    <nav className="flex text-sm text-slate-400">
                        <Link to="/keuangan" className="hover:text-indigo-400 transition-colors">Keuangan</Link>
                        <span className="mx-2">/</span>
                        <Link to="/keuangan/bmn" className="hover:text-indigo-400 transition-colors">Barang Milik Negara</Link>
                        <span className="mx-2">/</span>
                        <span className="text-white">Peminjaman</span>
                    </nav>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Riwayat Peminjaman BMN</h1>
                        <p className="text-slate-400 mt-1">Kelola daftar peminjaman dan pengembalian barang</p>
                    </div>
                </div>

                {/* Top Bar */}
                <div className="glass-panel p-5 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Cari peminjam, barang..."
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
                                    <th className="p-4 font-medium">Kode Barang</th>
                                    <th className="p-4 font-medium">Nama Barang</th>
                                    <th className="p-4 font-medium">Merk/Type</th>
                                    <th className="p-4 font-medium">Kategori</th>
                                    <th className="p-4 font-medium">Tgl Pinjam</th>
                                    <th className="p-4 font-medium">Tgl Kembali</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {loading ? (
                                    <tr><td colSpan="10" className="p-8 text-center text-slate-400">Memuat data...</td></tr>
                                ) : currentItems.length === 0 ? (
                                    <tr><td colSpan="10" className="p-8 text-center text-slate-400">Belum ada riwayat peminjaman</td></tr>
                                ) : (
                                    currentItems.map((item, index) => {
                                        const bmn = item.bmnItem || {};
                                        return (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 text-center text-slate-400">{indexOfFirstItem + index + 1}</td>
                                                <td className="p-4">
                                                    <p className="text-white font-medium">{item.nama_peminjam}</p>
                                                    <p className="text-xs text-slate-400">{item.nip_peminjam}</p>
                                                </td>
                                                <td className="p-4 text-slate-300">{bmn.kode_barang}</td>
                                                <td className="p-4 text-white font-medium">{bmn.nama_barang}</td>
                                                <td className="p-4 text-slate-300">{bmn.merk_type}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-[11px] rounded-md ${CATEGORY_COLORS[bmn.kategori] || CATEGORY_COLORS['Lainnya']}`}>
                                                        {bmn.kategori}
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
                                                        <button onClick={() => setDeleteModal({ isOpen: true, itemId: item.id, bmnId: item.bmnId, status: item.status })} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Hapus">
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

export default BmnBorrowingHistory;
