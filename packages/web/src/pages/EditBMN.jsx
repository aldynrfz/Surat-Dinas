import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { updateBMN } from '../services/dataService';
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

const EditBMN = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const bmnData = location.state?.bmn;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        no_bmn: bmnData?.no_bmn || '',
        kode_barang: bmnData?.kode_barang || '',
        nama_barang: bmnData?.nama_barang || '',
        merk_type: bmnData?.merk_type || '',
        warna: bmnData?.warna || '',
        kategori: bmnData?.kategori || '',
        tahun_pengadaan: bmnData?.tahun_pengadaan || new Date().getFullYear().toString(),
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Redirect if no data passed
    if (!bmnData) {
        return (
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-4xl mx-auto text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-slate-600 block mb-4">error</span>
                    <p className="text-white text-lg mb-2">Data barang tidak ditemukan</p>
                    <p className="text-slate-400 mb-6">Silakan kembali ke halaman daftar BMN</p>
                    <button
                        onClick={() => navigate('/keuangan/bmn')}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all"
                    >
                        Kembali ke Daftar BMN
                    </button>
                </div>
            </div>
        );
    }

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
        try {
            await updateBMN(bmnData.id, formData);
            showToast('Data barang berhasil diperbarui!', 'success');
            setTimeout(() => navigate('/keuangan/bmn'), 1500);
        } catch (error) {
            console.error('Error updating BMN:', error);
            showToast('Gagal memperbarui data: ' + error.message, 'error');
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
                    <span className="text-white">Edit Barang</span>
                </nav>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/keuangan/bmn')}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Edit Barang</h1>
                        <p className="text-slate-400 mt-1">Perbarui data inventaris: <span className="text-indigo-400">{bmnData.nama_barang}</span></p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Card 1: Identitas Barang */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-400">inventory_2</span>
                        Identitas Barang
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">No BMN <span className="text-red-400">*</span></label>
                            <input type="text" name="no_bmn" value={formData.no_bmn} onChange={handleChange}
                                placeholder="Masukkan No BMN" className={inputClass} required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Kode Barang <span className="text-red-400">*</span></label>
                            <input type="text" name="kode_barang" value={formData.kode_barang} onChange={handleChange}
                                placeholder="Masukkan Kode Barang" className={inputClass} required />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">Jenis / Nama Barang <span className="text-red-400">*</span></label>
                            <input type="text" name="nama_barang" value={formData.nama_barang} onChange={handleChange}
                                placeholder="Contoh: Laptop, Meja Guru, Papan Tulis" className={inputClass} required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Merk / Type</label>
                            <input type="text" name="merk_type" value={formData.merk_type} onChange={handleChange}
                                placeholder="Contoh: Asus VivoBook / Olympic" className={inputClass} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Warna</label>
                            <input type="text" name="warna" value={formData.warna} onChange={handleChange}
                                placeholder="Contoh: Hitam, Coklat, Abu-abu" className={inputClass} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tahun Pengadaan <span className="text-red-400">*</span></label>
                            <input type="number" name="tahun_pengadaan" value={formData.tahun_pengadaan} onChange={handleChange}
                                placeholder="Contoh: 2024" min="1990" max="2100" className={inputClass} required />
                        </div>
                    </div>
                </div>

                {/* Card 2: Kategori */}
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

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/keuangan/bmn')}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-7 py-3 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">save</span>
                                <span>Simpan Perubahan</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
};

export default EditBMN;
