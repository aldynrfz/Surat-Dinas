import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getAllLibraryBooks, deleteLibraryBook } from '../services/dataService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

// ── Jenis & Kategori Buku ──────────────────────────────────────────────────
const JENIS_BUKU = ['Buku Paket Mapel', 'Buku Umum'];

const KATEGORI_MAPEL = [
    'Kelas 7 Umum', 'Kelas 7 Agama',
    'Kelas 8 Umum', 'Kelas 8 Agama',
    'Kelas 9 Umum', 'Kelas 9 Agama'
];

const KATEGORI_UMUM = [
    'Fiksi',
    'Komik dan Novel Grafis',
    'Agama',
    'Sains dan Teknologi',
    'Sejarah dan Biografi',
    'Seni, Hobi, dan Olahraga',
    'Pengembangan Diri',
    'Referensi',
];

const CATEGORY_ICONS = {
    'Kelas 7 Umum': 'menu_book',
    'Kelas 7 Agama': 'mosque',
    'Kelas 8 Umum': 'menu_book',
    'Kelas 8 Agama': 'mosque',
    'Kelas 9 Umum': 'menu_book',
    'Kelas 9 Agama': 'mosque',
    'Buku Paket Mapel': 'auto_stories',
    'Fiksi': 'book_2',
    'Komik dan Novel Grafis': 'comic_bubble',
    'Agama': 'mosque',
    'Sains dan Teknologi': 'science',
    'Sejarah dan Biografi': 'history_edu',
    'Seni, Hobi, dan Olahraga': 'palette',
    'Pengembangan Diri': 'psychology',
    'Referensi': 'dictionary',
};

const CATEGORY_COLORS = {
    'Kelas 7 Umum': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Kelas 7 Agama': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Kelas 8 Umum': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Kelas 8 Agama': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Kelas 9 Umum': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Kelas 9 Agama': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Buku Paket Mapel': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Fiksi': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Komik dan Novel Grafis': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Agama': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Sains dan Teknologi': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Sejarah dan Biografi': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Seni, Hobi, dan Olahraga': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    'Pengembangan Diri': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    'Referensi': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

// ── Preview Modal ─────────────────────────────────────────────────────────
const PreviewModal = ({ book, onClose }) => {
    if (!book) return null;

    const kategori = book.kategori || book.jenis;
    const colorClass = CATEGORY_COLORS[kategori] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    const iconName = CATEGORY_ICONS[kategori] || 'menu_book';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#1c1b2e] border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                            <span className="material-symbols-outlined text-[22px]">{iconName}</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Detail Buku</h2>
                            <p className="text-xs text-slate-400">Perpustakaan Madrasah</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'No BMN', value: book.no_bmn },
                            { label: 'Kode Buku', value: book.kode_buku },
                            { label: 'Judul Buku', value: book.judul_buku, full: true },
                            { label: 'Penulis', value: book.penulis },
                            { label: 'Penerbit', value: book.penerbit },
                            { label: 'Tahun', value: book.tahun },
                            { label: 'ISBN', value: book.isbn },
                        ].map(({ label, value, full }) => (
                            <div key={label} className={full ? 'col-span-2' : ''}>
                                <p className="text-xs text-slate-500 mb-1">{label}</p>
                                <p className="text-white font-medium bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                                    {value || <span className="text-slate-500 italic">Tidak diisi</span>}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Jenis</p>
                            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium bg-white/5 text-white border-white/10">
                                {book.jenis || '-'}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Kategori</p>
                            <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${colorClass}`}>
                                <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                                {kategori || 'Tidak dikategorikan'}
                            </span>
                        </div>
                        {book.jenis === 'Buku Paket Mapel' && book.peruntukan && (
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Peruntukan</p>
                                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium bg-white/5 text-white border-white/10">
                                    <span className="material-symbols-outlined text-[18px]">group</span>
                                    {book.peruntukan}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 pt-0">
                    <button onClick={onClose} className="px-5 py-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Excel Modal ────────────────────────────────────────────────────────────
const ExcelModal = ({ isOpen, onClose, onExport, onImport }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-sm bg-[#1c1b2e] border border-white/10 rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Kelola Data Excel</h3>
                <p className="text-sm text-slate-300 mb-6">Pilih aksi yang ingin Anda lakukan terhadap data Buku Perpustakaan.</p>
                
                <div className="flex flex-col gap-3 mb-6">
                    <button onClick={() => { onExport(); onClose(); }} className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50 rounded-xl transition-all">
                        <span className="material-symbols-outlined">download</span>Unduh Data (Export)
                    </button>
                    
                    <div className="relative">
                        <input type="file" id="import-excel-lib" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { onImport(e); onClose(); }} />
                        <label htmlFor="import-excel-lib" className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-xl transition-all cursor-pointer w-full">
                            <span className="material-symbols-outlined">upload_file</span>Unggah Data (Import)
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors">Batal</button>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const LibraryBookData = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [bookList, setBookList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterJenis, setFilterJenis] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'tahun', direction: 'desc' });

    const [currentPage, setCurrentPage] = useState(location.state?.returnPage || 1);
    const [itemsPerPage] = useState(10);

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, bookId: null, bookName: '' });
    const [previewBook, setPreviewBook] = useState(null);
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchBooks(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const data = await getAllLibraryBooks();
            setBookList(data);
        } catch {
            showToast('Gagal memuat data buku', 'error');
        } finally {
            setLoading(false);
        }
    };

    const availableYears = [...new Set(bookList.map(b => b.tahun).filter(Boolean))].sort((a, b) => b - a);

    const allCategories = [...KATEGORI_MAPEL, ...KATEGORI_UMUM];

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const filteredBooks = bookList.filter(book => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            (book.judul_buku?.toLowerCase() || '').includes(q) ||
            (book.no_bmn?.toLowerCase() || '').includes(q) ||
            (book.kode_buku?.toLowerCase() || '').includes(q) ||
            (book.penulis?.toLowerCase() || '').includes(q) ||
            (book.penerbit?.toLowerCase() || '').includes(q) ||
            (book.isbn?.toLowerCase() || '').includes(q);

        const bookKategori = book.kategori;

        return matchesSearch &&
            (filterJenis ? book.jenis === filterJenis : true) &&
            (filterCategory ? bookKategori === filterCategory : true);
    });

    const sortedBooks = [...filteredBooks].sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedBooks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);

    const handleExportExcel = () => {
        const headers = ['No BMN', 'Kode Buku', 'Judul Buku', 'Penulis', 'Penerbit', 'Tahun', 'Jenis', 'Kategori', 'ISBN'];
        const rows = sortedBooks.map(b =>
            `"${b.no_bmn || ''}","${b.kode_buku || ''}","${b.judul_buku || ''}","${b.penulis || ''}","${b.penerbit || ''}","${b.tahun || ''}","${b.jenis || ''}","${b.kategori || ''}","${b.isbn || ''}"`
        );
        const uri = encodeURI('data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.join('\n'));
        const a = document.createElement('a');
        a.href = uri;
        a.download = 'Data_Buku_Perpus.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Data buku berhasil diunduh sebagai CSV', 'success');
    };

    const handleImportExcel = (e) => {
        if (e.target.files?.[0]) showToast('Fitur upload file excel akan segera tersedia', 'info');
    };

    const handleDeleteClick = (book) => setDeleteModal({ isOpen: true, bookId: book.id, bookName: book.judul_buku });

    const handleConfirmDelete = async () => {
        try {
            await deleteLibraryBook(deleteModal.bookId);
            showToast('Buku berhasil dihapus', 'success');
            fetchBooks();
        } catch (e) {
            showToast('Gagal menghapus buku: ' + e.message, 'error');
        } finally {
            setDeleteModal({ isOpen: false, bookId: null, bookName: '' });
        }
    };

    const SortIcon = ({ col }) => sortConfig.key === col
        ? <span className="material-symbols-outlined text-[16px] text-blue-400">{sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
        : null;

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, bookId: null, bookName: '' })}
                onConfirm={handleConfirmDelete}
                title="Hapus Buku"
                message={`Apakah Anda yakin ingin menghapus buku "${deleteModal.bookName}"? Data yang dihapus tidak dapat dikembalikan.`}
            />

            <PreviewModal book={previewBook} onClose={() => setPreviewBook(null)} />

            <ExcelModal
                isOpen={isExcelModalOpen}
                onClose={() => setIsExcelModalOpen(false)}
                onExport={handleExportExcel}
                onImport={handleImportExcel}
            />


            <div className="flex flex-col gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-white">Buku Perpustakaan</h1>
                    <p className="text-slate-400 mt-1">Kelola daftar inventaris buku perpustakaan madrasah</p>
                </div>
            </div>

            {/* Top Bar */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Cari judul, kode, penulis, ISBN..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <select value={filterJenis} onChange={e => { setFilterJenis(e.target.value); setFilterCategory(''); setCurrentPage(1); }}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none">
                        <option value="" className="bg-slate-800">Semua Jenis</option>
                        {JENIS_BUKU.map(j => <option key={j} value={j} className="bg-slate-800">{j}</option>)}
                    </select>
                    {filterJenis === 'Buku Umum' && (
                        <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none">
                            <option value="" className="bg-slate-800">Semua Kategori</option>
                            {KATEGORI_UMUM.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                        </select>
                    )}
                    {filterJenis === 'Buku Paket Mapel' && (
                        <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none">
                            <option value="" className="bg-slate-800">Semua Kelas</option>
                            {KATEGORI_MAPEL.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                        </select>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
                    <button onClick={() => setIsExcelModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-sm">table_chart</span>Kelola Excel
                    </button>

                </div>
            </div>

            {/* Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-slate-300 text-sm">
                                <th className="p-4 font-medium w-14 text-center">No</th>
                                <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('no_bmn')}>
                                    <div className="flex items-center gap-1">No BMN <SortIcon col="no_bmn" /></div>
                                </th>
                                <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('kode_buku')}>
                                    <div className="flex items-center gap-1">Kode Buku <SortIcon col="kode_buku" /></div>
                                </th>
                                <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('judul_buku')}>
                                    <div className="flex items-center gap-1">Judul Buku <SortIcon col="judul_buku" /></div>
                                </th>
                                <th className="p-4 font-medium">Penulis</th>
                                <th className="p-4 font-medium">Penerbit</th>
                                <th className="p-4 font-medium">Kategori</th>
                                <th className="p-4 font-medium">Tahun</th>
                                <th className="p-4 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr><td colSpan="9" className="p-10 text-center text-slate-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                        Memuat data...
                                    </div>
                                </td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="9" className="p-10 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">library_books</span>
                                    Tidak ada data buku
                                </td></tr>
                            ) : currentItems.map((book, idx) => {
                                const kategori = book.kategori || book.jenis;
                                const catColor = CATEGORY_COLORS[kategori] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
                                const catIcon = CATEGORY_ICONS[kategori] || 'menu_book';
                                return (
                                    <tr key={book.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-center text-slate-500">{indexOfFirstItem + idx + 1}</td>
                                        <td className="p-4 text-white font-medium">{book.no_bmn || '-'}</td>
                                        <td className="p-4 text-slate-300">{book.kode_buku || '-'}</td>
                                        <td className="p-4 text-white">{book.judul_buku || '-'}</td>
                                        <td className="p-4 text-slate-300">{book.penulis || '-'}</td>
                                        <td className="p-4 text-slate-300">{book.penerbit || '-'}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${catColor}`}>
                                                    <span className="material-symbols-outlined text-[14px]">{catIcon}</span>
                                                    {kategori || '-'}
                                                </span>
                                                {book.jenis === 'Buku Paket Mapel' && book.peruntukan && (
                                                    <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/5 text-slate-300 border border-white/10">
                                                        <span className="material-symbols-outlined text-[12px]">group</span>
                                                        {book.peruntukan}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-300">{book.tahun || '-'}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-1.5 transition-opacity">
                                                <button onClick={() => setPreviewBook(book)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Preview Detail">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                                <button onClick={() => navigate(`/perpustakaan/edit-buku/${book.id}`, { state: { book, fromPage: currentPage } })} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors" title="Edit Buku">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button onClick={() => handleDeleteClick(book)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Hapus Buku">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && sortedBooks.length > 0 && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm flex-col sm:flex-row gap-4">
                        <div className="text-slate-400">
                            Menampilkan <span className="text-white font-medium">{indexOfFirstItem + 1}</span>–<span className="text-white font-medium">{Math.min(indexOfLastItem, sortedBooks.length)}</span> dari <span className="text-white font-medium">{sortedBooks.length}</span> data
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
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-sm ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
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

export default LibraryBookData;
