import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addBMN } from '../services/dataService';
import Toast from '../components/Toast';

const CATEGORIES = [
    { id: 'Elektronik', icon: 'devices', label: 'Elektronik', color: 'blue' },
    { id: 'Furniture', icon: 'chair', label: 'Furniture', color: 'amber' },
    { id: 'Kendaraan', icon: 'directions_car', label: 'Kendaraan', color: 'green' },
    { id: 'Alat Tulis', icon: 'edit', label: 'Alat Tulis', color: 'pink' },
    { id: 'Peralatan', icon: 'handyman', label: 'Peralatan', color: 'orange' },
    { id: 'Buku', icon: 'menu_book', label: 'Buku', color: 'teal' },
    { id: 'Lainnya', icon: 'category', label: 'Lainnya', color: 'slate' },
];

const colorMap = {
    blue:   'bg-blue-500/20   border-blue-500   text-blue-400',
    amber:  'bg-amber-500/20  border-amber-500  text-amber-400',
    green:  'bg-emerald-500/20 border-emerald-500 text-emerald-400',
    pink:   'bg-pink-500/20   border-pink-500   text-pink-400',
    orange: 'bg-orange-500/20 border-orange-500 text-orange-400',
    teal:   'bg-teal-500/20   border-teal-500   text-teal-400',
    slate:  'bg-slate-500/20  border-slate-500  text-slate-300',
};

// ─── Helper: Generate kode & no BMN berurutan ────────────────────────────────
// Contoh: base = "6.01.01.01.01.999", qty = 3
// → ["6.01.01.01.01.999.0001", "6.01.01.01.01.999.0002", "6.01.01.01.01.999.0003"]
const generateSequential = (base, qty) => {
    if (!base || qty <= 1) return [base];
    return Array.from({ length: qty }, (_, i) =>
        `${base}.${String(i + 1).padStart(4, '0')}`
    );
};

const AddBMN = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 });
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        no_bmn: '',
        kode_barang: '',
        nama_barang: '',
        merk_type: '',
        warna: '',
        kategori: '',
        tahun_pengadaan: new Date().getFullYear().toString(),
        kuantitas: 1,
    });

    // ── Preview data yang akan dihasilkan ──────────────────────────────────────
    const qty = Math.max(1, parseInt(formData.kuantitas) || 1);
    const isMultiple = qty > 1;

    const previewItems = useMemo(() => {
        if (!isMultiple) return [];
        return generateSequential(formData.kode_barang, qty).map(kode => ({
            kode_barang: kode,
        }));
    }, [formData.kode_barang, qty, isMultiple]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategorySelect = (categoryId) => {
        setFormData(prev => ({ ...prev, kategori: categoryId }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.no_bmn || !formData.kode_barang || !formData.nama_barang) {
            showToast('No BMN, Kode Barang, dan Nama Barang wajib diisi', 'error');
            return;
        }
        if (!formData.kategori) {
            showToast('Silakan pilih kategori barang terlebih dahulu', 'error');
            return;
        }

        setIsSubmitting(true);
        const kodes = generateSequential(formData.kode_barang, qty);
        setSubmitProgress({ current: 0, total: qty });

        try {
            for (let i = 0; i < qty; i++) {
                const payload = {
                    ...formData,
                    no_bmn: formData.no_bmn, // No BMN tetap sama untuk semua record
                    kode_barang: kodes[i],
                    kuantitas: 1,
                };
                await addBMN(payload);
                setSubmitProgress({ current: i + 1, total: qty });
            }

            showToast(
                qty > 1
                    ? `${qty} barang berhasil ditambahkan!`
                    : 'Barang Milik Negara berhasil ditambahkan!',
                'success'
            );
            setTimeout(() => navigate('/keuangan/bmn'), 1500);
        } catch (error) {
            console.error('Error saving BMN:', error);
            showToast('Gagal menyimpan data barang: ' + error.message, 'error');
            setIsSubmitting(false);
        }
    };

    const inputClass =
        'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all';

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Breadcrumb & Header */}
            <div className="flex flex-col gap-3">
                <nav className="flex text-sm text-slate-400">
                    <Link to="/keuangan" className="hover:text-indigo-400 transition-colors">Keuangan</Link>
                    <span className="mx-2">/</span>
                    <Link to="/keuangan/bmn" className="hover:text-indigo-400 transition-colors">Barang Milik Negara</Link>
                    <span className="mx-2">/</span>
                    <span className="text-white">Tambah Barang</span>
                </nav>
                <div>
                    <h1 className="text-3xl font-bold text-white">Tambah Barang BMN</h1>
                    <p className="text-slate-400 mt-1">Input data inventaris Barang Milik Negara baru</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Card 1: Identitas Barang ─── */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-400">inventory_2</span>
                        Identitas Barang
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* No BMN */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                No BMN
                            </label>
                            <input
                                type="text"
                                name="no_bmn"
                                value={formData.no_bmn}
                                onChange={handleChange}
                                placeholder="Contoh: 2026.001.001"
                                className={inputClass}
                                required
                            />
                        </div>

                        {/* Kode Barang */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                Kode Barang <span className="text-red-400">*</span>
                                {isMultiple && <span className="ml-2 text-xs text-indigo-400 font-normal">(Kode dasar, sufiks .0001–.{String(qty).padStart(4,'0')} otomatis)</span>}
                            </label>
                            <input
                                type="text"
                                name="kode_barang"
                                value={formData.kode_barang}
                                onChange={handleChange}
                                placeholder="Contoh: 6.01.01.01.01.999"
                                className={inputClass}
                                required
                            />
                        </div>

                        {/* Jenis / Nama Barang */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">
                                Jenis / Nama Barang <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="nama_barang"
                                value={formData.nama_barang}
                                onChange={handleChange}
                                placeholder="Contoh: Laptop, Meja Guru, Papan Tulis"
                                className={inputClass}
                                required
                            />
                        </div>

                        {/* Merk / Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Merk / Type</label>
                            <input
                                type="text"
                                name="merk_type"
                                value={formData.merk_type}
                                onChange={handleChange}
                                placeholder="Contoh: Asus VivoBook / Olympic"
                                className={inputClass}
                            />
                        </div>

                        {/* Warna */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Warna</label>
                            <input
                                type="text"
                                name="warna"
                                value={formData.warna}
                                onChange={handleChange}
                                placeholder="Contoh: Hitam, Coklat, Abu-abu"
                                className={inputClass}
                            />
                        </div>

                        {/* Tahun Pengadaan */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                Tahun Pengadaan <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                name="tahun_pengadaan"
                                value={formData.tahun_pengadaan}
                                onChange={handleChange}
                                placeholder="Contoh: 2024"
                                min="1990"
                                max="2100"
                                className={inputClass}
                                required
                            />
                        </div>

                        {/* ── Kuantitas ── */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                Kuantitas
                                <span className="ml-2 text-xs text-slate-500 font-normal">
                                    (Isi &gt; 1 untuk input masal)
                                </span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                                    stack
                                </span>
                                <input
                                    type="number"
                                    name="kuantitas"
                                    value={formData.kuantitas}
                                    onChange={handleChange}
                                    min="1"
                                    max="999"
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Preview Kode Masal (muncul hanya jika kuantitas > 1) ─── */}
                {isMultiple && formData.kode_barang && (
                    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5">
                        <h2 className="text-base font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">preview</span>
                            Preview — akan disimpan <span className="text-white font-bold">{qty}</span> record barang
                        </h2>
                        <p className="text-slate-400 text-xs mb-4">
                            Kode dasar <code className="text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">{formData.kode_barang}</code> akan diberi sufiks <code className="text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">.0001</code> s/d <code className="text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">.{String(qty).padStart(4, '0')}</code>. No BMN <span className="text-white font-medium">{formData.no_bmn || '-'}</span> akan sama untuk semua record.
                        </p>

                        {/* Tampilkan maks 10 baris preview */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-400">
                                        <th className="py-2 px-3 text-left font-medium w-10">#</th>
                                        <th className="py-2 px-3 text-left font-medium">Kode Barang</th>
                                        <th className="py-2 px-3 text-left font-medium">Nama Barang</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {previewItems.slice(0, 10).map((item, i) => (
                                        <tr key={i} className="text-slate-300">
                                            <td className="py-1.5 px-3 text-slate-500">{i + 1}</td>
                                            <td className="py-1.5 px-3 font-mono text-indigo-400">{item.kode_barang}</td>
                                            <td className="py-1.5 px-3 text-white">{formData.nama_barang || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {qty > 10 && (
                            <p className="mt-3 text-xs text-slate-500 text-center">
                                … dan <span className="text-white">{qty - 10}</span> barang lainnya (tidak ditampilkan semua)
                            </p>
                        )}
                    </div>
                )}

                {/* ── Card 3: Kategori ─── */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-400">label</span>
                        Kategori Barang <span className="text-red-400 text-sm font-normal">(Wajib dipilih)</span>
                    </h2>
                    <p className="text-slate-400 text-sm mb-6">Pilih salah satu kategori yang sesuai dengan jenis barang</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CATEGORIES.map(cat => {
                            const isSelected = formData.kategori === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className={`
                                        relative cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2
                                        transition-all duration-200 select-none
                                        ${isSelected
                                            ? `${colorMap[cat.color]} shadow-lg scale-105`
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                                        }
                                    `}
                                >
                                    {isSelected && (
                                        <span className="absolute top-1.5 right-1.5 material-symbols-outlined text-[14px] text-current">
                                            check_circle
                                        </span>
                                    )}
                                    <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                    <span className="font-medium text-xs text-current">{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {formData.kategori && (
                        <p className="mt-4 text-sm text-slate-400">
                            Kategori dipilih: <span className="text-white font-medium">{formData.kategori}</span>
                        </p>
                    )}
                </div>

                {/* ── Progress Bar (muncul saat submit masal) ─── */}
                {isSubmitting && submitProgress.total > 1 && (
                    <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-300">Menyimpan barang...</span>
                            <span className="text-white font-medium">
                                {submitProgress.current} / {submitProgress.total}
                            </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-2 bg-indigo-500 rounded-full transition-all duration-300"
                                style={{ width: `${(submitProgress.current / submitProgress.total) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Jangan tutup halaman ini sampai selesai
                        </p>
                    </div>
                )}

                {/* ── Tombol Aksi ─── */}
                <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-slate-400">
                        {isMultiple && (
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px] text-indigo-400">info</span>
                                Akan menyimpan <span className="text-white font-semibold">{qty}</span> record sekaligus
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/keuangan/bmn')}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-7 py-3 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Menyimpan{submitProgress.total > 1 ? ` (${submitProgress.current}/${submitProgress.total})` : ''}...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    <span>Simpan{isMultiple ? ` ${qty} Barang` : ' BMN'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
        </div>
    );
};

export default AddBMN;
