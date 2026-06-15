import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllBMN, deleteBMN } from '../services/dataService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

const CATEGORY_ICONS = {
    'Elektronik': 'devices',
    'Furniture': 'chair',
    'Kendaraan': 'directions_car',
    'Alat Tulis': 'edit',
    'Peralatan': 'handyman',
    'Buku': 'menu_book',
    'Lainnya': 'category',
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

// ── Preview Modal ─────────────────────────────────────────────────────────────
const PreviewModal = ({ bmn, onClose }) => {
    if (!bmn) return null;

    const colorClass = CATEGORY_COLORS[bmn.kategori] || CATEGORY_COLORS['Lainnya'];
    const iconName = CATEGORY_ICONS[bmn.kategori] || 'category';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#1c1b2e] border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                            <span className="material-symbols-outlined text-[22px]">{iconName}</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Detail Barang</h2>
                            <p className="text-xs text-slate-400">Barang Milik Negara</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'No BMN', value: bmn.no_bmn },
                            { label: 'Kode Barang', value: bmn.kode_barang },
                            { label: 'Jenis / Nama Barang', value: bmn.nama_barang, full: true },
                            { label: 'Merk / Type', value: bmn.merk_type },
                            { label: 'Warna', value: bmn.warna },
                            { label: 'Tahun Pengadaan', value: bmn.tahun_pengadaan },
                        ].map(({ label, value, full }) => (
                            <div key={label} className={full ? 'col-span-2' : ''}>
                                <p className="text-xs text-slate-500 mb-1">{label}</p>
                                <p className="text-white font-medium bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                                    {value || <span className="text-slate-500 italic">Tidak diisi</span>}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Kategori */}
                    <div>
                        <p className="text-xs text-slate-500 mb-2">Kategori</p>
                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${colorClass}`}>
                            <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                            {bmn.kategori || 'Tidak dikategorikan'}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                    >
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
                <p className="text-sm text-slate-300 mb-6">Pilih aksi yang ingin Anda lakukan terhadap data Barang Milik Negara.</p>
                
                <div className="flex flex-col gap-3 mb-6">
                    <button onClick={() => { onExport(); onClose(); }} className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50 rounded-xl transition-all">
                        <span className="material-symbols-outlined">download</span>Unduh Data (Export)
                    </button>
                    
                    <div className="relative">
                        <input type="file" id="import-excel-modal" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { onImport(e); onClose(); }} />
                        <label htmlFor="import-excel-modal" className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-xl transition-all cursor-pointer w-full">
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
const BMNData = () => {
    const navigate = useNavigate();
    const [bmnList, setBmnList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'tahun_pengadaan', direction: 'desc' });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, bmnId: null, bmnName: '' });
    const [previewBmn, setPreviewBmn] = useState(null);
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchBMN(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchBMN = async () => {
        setLoading(true);
        try {
            const data = await getAllBMN();
            setBmnList(data);
        } catch {
            showToast('Gagal memuat data BMN', 'error');
        } finally {
            setLoading(false);
        }
    };

    const availableYears = [...new Set(bmnList.map(b => b.tahun_pengadaan).filter(Boolean))].sort((a, b) => b - a);
    const availableCategories = ['Elektronik', 'Furniture', 'Kendaraan', 'Alat Tulis', 'Peralatan', 'Buku', 'Lainnya'];

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const filteredBMN = bmnList.filter(bmn => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            (bmn.nama_barang?.toLowerCase() || '').includes(q) ||
            (bmn.no_bmn?.toLowerCase() || '').includes(q) ||
            (bmn.kode_barang?.toLowerCase() || '').includes(q) ||
            (bmn.merk_type?.toLowerCase() || '').includes(q);
        return matchesSearch &&
            (filterYear ? bmn.tahun_pengadaan === filterYear : true) &&
            (filterCategory ? bmn.kategori === filterCategory : true);
    });

    const sortedBMN = [...filteredBMN].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedBMN.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedBMN.length / itemsPerPage);

    const handleExportExcel = () => {
        const headers = ['No BMN', 'Kode Barang', 'Jenis/Nama Barang', 'Merk/Type', 'Warna', 'Kategori', 'Tahun Pengadaan'];
        const rows = sortedBMN.map(b =>
            `"${b.no_bmn || ''}","${b.kode_barang || ''}","${b.nama_barang || ''}","${b.merk_type || ''}","${b.warna || ''}","${b.kategori || ''}","${b.tahun_pengadaan || ''}"`
        );
        const uri = encodeURI('data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.join('\n'));
        const a = document.createElement('a');
        a.href = uri;
        a.download = 'Data_BMN.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Data BMN berhasil diunduh sebagai CSV', 'success');
    };

    const handleImportExcel = (e) => {
        if (e.target.files?.[0]) showToast('Fitur upload file excel akan segera tersedia secara fungsional', 'info');
    };

    const handleDeleteClick = (bmn) => setDeleteModal({ isOpen: true, bmnId: bmn.id, bmnName: bmn.nama_barang });

    const handleConfirmDelete = async () => {
        try {
            await deleteBMN(deleteModal.bmnId);
            showToast('Barang berhasil dihapus', 'success');
            fetchBMN();
        } catch (e) {
            showToast('Gagal menghapus barang: ' + e.message, 'error');
        } finally {
            setDeleteModal({ isOpen: false, bmnId: null, bmnName: '' });
        }
    };

    const SortIcon = ({ col }) => sortConfig.key === col
        ? <span className="material-symbols-outlined text-[16px] text-indigo-400">{sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
        : null;

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, bmnId: null, bmnName: '' })}
                onConfirm={handleConfirmDelete}
                title="Hapus Barang"
                message={`Apakah Anda yakin ingin menghapus barang "${deleteModal.bmnName}"? Data yang dihapus tidak dapat dikembalikan.`}
            />

            <PreviewModal bmn={previewBmn} onClose={() => setPreviewBmn(null)} />

            <ExcelModal 
                isOpen={isExcelModalOpen} 
                onClose={() => setIsExcelModalOpen(false)} 
                onExport={handleExportExcel} 
                onImport={handleImportExcel} 
            />

            {/* Breadcrumb */}
            <div className="flex flex-col gap-3">
                <nav className="flex text-sm text-slate-400">
                    <Link to="/keuangan" className="hover:text-indigo-400 transition-colors">Keuangan</Link>
                    <span className="mx-2">/</span>
                    <span className="text-white">Barang Milik Negara</span>
                </nav>
                <div>
                    <h1 className="text-3xl font-bold text-white">Barang Milik Negara</h1>
                    <p className="text-slate-400 mt-1">Kelola daftar inventaris dan aset madrasah</p>
                </div>
            </div>

            {/* Top Bar */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Cari nama, No BMN, kode..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none">
                        <option value="" className="bg-slate-800">Semua Kategori</option>
                        {availableCategories.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                    </select>
                    <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none">
                        <option value="" className="bg-slate-800">Semua Tahun</option>
                        {availableYears.map(y => <option key={y} value={y} className="bg-slate-800">{y}</option>)}
                    </select>
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
                    <button onClick={() => setIsExcelModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-sm">table_chart</span>Kelola Excel
                    </button>
                    <button onClick={() => navigate('/keuangan/bmn/peminjaman')} className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-sm">handshake</span>Peminjaman
                    </button>
                    <button onClick={() => navigate('/keuangan/bmn/tambah')} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/25">
                        <span className="material-symbols-outlined text-sm">add</span>Tambah Barang
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
                                <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('kode_barang')}>
                                    <div className="flex items-center gap-1">Kode Barang <SortIcon col="kode_barang" /></div>
                                </th>
                                <th className="p-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('nama_barang')}>
                                    <div className="flex items-center gap-1">Jenis / Nama Barang <SortIcon col="nama_barang" /></div>
                                </th>
                                <th className="p-4 font-medium">Merk/Type</th>
                                <th className="p-4 font-medium">Warna</th>
                                <th className="p-4 font-medium">Kategori</th>
                                <th className="p-4 font-medium">Tahun</th>
                                <th className="p-4 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr><td colSpan="9" className="p-10 text-center text-slate-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                        Memuat data...
                                    </div>
                                </td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="9" className="p-10 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">inventory_2</span>
                                    Tidak ada data BMN
                                </td></tr>
                            ) : currentItems.map((bmn, idx) => {
                                const catColor = CATEGORY_COLORS[bmn.kategori] || CATEGORY_COLORS['Lainnya'];
                                return (
                                    <tr key={bmn.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-center text-slate-500">{indexOfFirstItem + idx + 1}</td>
                                        <td className="p-4 text-white font-medium">{bmn.no_bmn || '-'}</td>
                                        <td className="p-4 text-slate-300">{bmn.kode_barang || '-'}</td>
                                        <td className="p-4 text-white">{bmn.nama_barang || '-'}</td>
                                        <td className="p-4 text-slate-300">{bmn.merk_type || '-'}</td>
                                        <td className="p-4 text-slate-300">{bmn.warna || '-'}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${catColor}`}>
                                                <span className="material-symbols-outlined text-[14px]">{CATEGORY_ICONS[bmn.kategori] || 'category'}</span>
                                                {bmn.kategori || '-'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-300">{bmn.tahun_pengadaan || '-'}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-1.5 transition-opacity">
                                                <button
                                                    onClick={() => setPreviewBmn(bmn)}
                                                    className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                                    title="Preview Detail"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/keuangan/bmn/edit/${bmn.id}`, { state: { bmn } })}
                                                    className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                                                    title="Edit Barang"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(bmn)}
                                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                    title="Hapus Barang"
                                                >
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
                {!loading && sortedBMN.length > 0 && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm">
                        <div className="text-slate-400">
                            Menampilkan <span className="text-white font-medium">{indexOfFirstItem + 1}</span>–<span className="text-white font-medium">{Math.min(indexOfLastItem, sortedBMN.length)}</span> dari <span className="text-white font-medium">{sortedBMN.length}</span> data
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-sm ${currentPage === i + 1 ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                                        {i + 1}
                                    </button>
                                ))}
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

export default BMNData;
