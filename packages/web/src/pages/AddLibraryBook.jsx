import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addLibraryBook } from '../services/dataService';
import Toast from '../components/Toast';

const JENIS_BUKU = [
    { id: 'Buku Paket Mapel', icon: 'auto_stories', label: 'Buku Paket Mapel', color: 'indigo' },
    { id: 'Buku Umum', icon: 'library_books', label: 'Buku Umum', color: 'blue' },
];

const KATEGORI_MAPEL = [
    { id: 'Kelas 7 Umum', icon: 'menu_book', label: 'Kelas 7 Umum', color: 'indigo', desc: 'Buku mapel umum kelas 7' },
    { id: 'Kelas 7 Agama', icon: 'mosque', label: 'Kelas 7 Agama', color: 'emerald', desc: 'Buku mapel agama kelas 7' },
    { id: 'Kelas 8 Umum', icon: 'menu_book', label: 'Kelas 8 Umum', color: 'blue', desc: 'Buku mapel umum kelas 8' },
    { id: 'Kelas 8 Agama', icon: 'mosque', label: 'Kelas 8 Agama', color: 'emerald', desc: 'Buku mapel agama kelas 8' },
    { id: 'Kelas 9 Umum', icon: 'menu_book', label: 'Kelas 9 Umum', color: 'cyan', desc: 'Buku mapel umum kelas 9' },
    { id: 'Kelas 9 Agama', icon: 'mosque', label: 'Kelas 9 Agama', color: 'emerald', desc: 'Buku mapel agama kelas 9' },
];

const KATEGORI_UMUM = [
    { id: 'Fiksi', icon: 'book_2', label: 'Fiksi', color: 'purple', desc: 'Novel, cerita pendek, dongeng, fabel' },
    { id: 'Komik dan Novel Grafis', icon: 'comic_bubble', label: 'Komik & Novel Grafis', color: 'pink', desc: 'Komik hiburan dan pendidikan' },
    { id: 'Agama', icon: 'mosque', label: 'Agama', color: 'emerald', desc: 'Kisah nabi, panduan ibadah, sejarah agama' },
    { id: 'Sains dan Teknologi', icon: 'science', label: 'Sains & Teknologi', color: 'cyan', desc: 'Alam, astronomi, hewan, tumbuhan, komputer' },
    { id: 'Sejarah dan Biografi', icon: 'history_edu', label: 'Sejarah & Biografi', color: 'amber', desc: 'Kisah pahlawan, sejarah nasional & dunia' },
    { id: 'Seni, Hobi, dan Olahraga', icon: 'palette', label: 'Seni, Hobi & Olahraga', color: 'rose', desc: 'Musik, menggambar, kerajinan, olahraga' },
    { id: 'Pengembangan Diri', icon: 'psychology', label: 'Pengembangan Diri', color: 'teal', desc: 'Motivasi, tips belajar, kepemimpinan' },
    { id: 'Referensi', icon: 'dictionary', label: 'Referensi', color: 'blue', desc: 'Kamus, ensiklopedia, atlas, undang-undang' },
];

const colorMap = {
    indigo:  'bg-indigo-500/20  border-indigo-500  text-indigo-400',
    blue:    'bg-blue-500/20    border-blue-500    text-blue-400',
    purple:  'bg-purple-500/20  border-purple-500  text-purple-400',
    pink:    'bg-pink-500/20    border-pink-500    text-pink-400',
    emerald: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
    cyan:    'bg-cyan-500/20    border-cyan-500    text-cyan-400',
    amber:   'bg-amber-500/20   border-amber-500   text-amber-400',
    rose:    'bg-rose-500/20    border-rose-500    text-rose-400',
    teal:    'bg-teal-500/20    border-teal-500    text-teal-400',
};

const generateSequential = (base, qty) => {
    if (!base || qty <= 1) return [base];
    return Array.from({ length: qty }, (_, i) =>
        `${base}.${String(i + 1).padStart(4, '0')}`
    );
};

const AddLibraryBook = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 });
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        no_bmn: '',
        kode_buku: '',
        judul_buku: '',
        penulis: '',
        penerbit: '',
        tahun: new Date().getFullYear().toString(),
        jenis: '',
        kategori: '',
        peruntukan: '',
        isbn: '',
        kuantitas: 1,
    });

    const qty = Math.max(1, parseInt(formData.kuantitas) || 1);
    const isMultiple = qty > 1;

    const previewItems = useMemo(() => {
        if (!isMultiple) return [];
        return generateSequential(formData.kode_buku, qty).map(kode => ({
            kode_buku: kode,
        }));
    }, [formData.kode_buku, qty, isMultiple]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleJenisSelect = (jenisId) => {
        setFormData(prev => ({
            ...prev,
            jenis: jenisId,
            kategori: '',
            peruntukan: '',
        }));
    };

    const handleCategorySelect = (categoryId) => {
        setFormData(prev => ({ ...prev, kategori: categoryId }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.no_bmn || !formData.kode_buku || !formData.judul_buku) {
            showToast('No BMN, Kode Buku, dan Judul Buku wajib diisi', 'error');
            return;
        }
        if (!formData.jenis) {
            showToast('Silakan pilih jenis buku terlebih dahulu', 'error');
            return;
        }
        if (formData.jenis === 'Buku Umum' && !formData.kategori) {
            showToast('Silakan pilih kategori buku umum', 'error');
            return;
        }
        if (formData.jenis === 'Buku Paket Mapel' && !formData.kategori) {
            showToast('Silakan pilih kelas untuk buku paket mapel', 'error');
            return;
        }
        if (formData.jenis === 'Buku Paket Mapel' && !formData.peruntukan) {
            showToast('Silakan pilih peruntukan untuk buku paket mapel', 'error');
            return;
        }

        setIsSubmitting(true);
        const kodes = generateSequential(formData.kode_buku, qty);
        setSubmitProgress({ current: 0, total: qty });

        try {
            for (let i = 0; i < qty; i++) {
                const payload = {
                    ...formData,
                    kode_buku: kodes[i],
                    kuantitas: 1,
                };
                await addLibraryBook(payload);
                setSubmitProgress(prev => ({ ...prev, current: prev.current + 1 }));
            }
            showToast(`${qty} buku berhasil ditambahkan!`, 'success');
            setTimeout(() => navigate('/perpustakaan/buku'), 1500);
        } catch (error) {
            console.error('Error adding book:', error);
            showToast('Gagal menambahkan buku: ' + error.message, 'error');
            setIsSubmitting(false);
        }
    };

    const inputClass =
        'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all';

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Breadcrumb & Header */}
            <div className="flex flex-col gap-3">

                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/perpustakaan/buku')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Tambah Buku Baru</h1>
                        <p className="text-slate-400 mt-1">Tambahkan data buku ke inventaris perpustakaan</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Card 1: Identitas Buku */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">library_books</span>
                        Identitas Buku
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">No BMN <span className="text-red-400">*</span></label>
                            <input type="text" name="no_bmn" value={formData.no_bmn} onChange={handleChange}
                                placeholder="Masukkan No BMN" className={inputClass} required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Kode Buku <span className="text-red-400">*</span></label>
                            <input type="text" name="kode_buku" value={formData.kode_buku} onChange={handleChange}
                                placeholder="Masukkan Kode Buku" className={inputClass} required />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">Judul Buku <span className="text-red-400">*</span></label>
                            <input type="text" name="judul_buku" value={formData.judul_buku} onChange={handleChange}
                                placeholder="Contoh: Matematika Kelas VII, Harry Potter" className={inputClass} required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Penulis</label>
                            <input type="text" name="penulis" value={formData.penulis} onChange={handleChange}
                                placeholder="Nama penulis buku" className={inputClass} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Penerbit</label>
                            <input type="text" name="penerbit" value={formData.penerbit} onChange={handleChange}
                                placeholder="Nama penerbit" className={inputClass} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tahun <span className="text-red-400">*</span></label>
                            <input type="number" name="tahun" value={formData.tahun} onChange={handleChange}
                                placeholder="2024" min="1900" max="2100" className={inputClass} required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">ISBN</label>
                            <input type="text" name="isbn" value={formData.isbn} onChange={handleChange}
                                placeholder="978-xxx-xxx-xxx-x" className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Card 2: Jenis Buku */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">category</span>
                        Jenis Buku <span className="text-red-400 text-sm font-normal">(Wajib dipilih)</span>
                    </h2>
                    <p className="text-slate-400 text-sm mb-6">Pilih jenis buku: Paket Mapel atau Umum</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {JENIS_BUKU.map(jenis => {
                            const isSelected = formData.jenis === jenis.id;
                            return (
                                <button
                                    key={jenis.id}
                                    type="button"
                                    onClick={() => handleJenisSelect(jenis.id)}
                                    className={`
                                        relative cursor-pointer p-5 rounded-xl border-2 flex flex-col items-center gap-2
                                        transition-all duration-200 select-none
                                        ${isSelected
                                            ? `${colorMap[jenis.color]} shadow-lg scale-105`
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                                        }
                                    `}
                                >
                                    {isSelected && (
                                        <span className="absolute top-1.5 right-1.5 material-symbols-outlined text-[14px] text-current">
                                            check_circle
                                        </span>
                                    )}
                                    <span className="material-symbols-outlined text-3xl">{jenis.icon}</span>
                                    <span className="font-medium text-sm text-current">{jenis.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Kategori Buku Paket Mapel */}
                    {formData.jenis === 'Buku Paket Mapel' && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <h3 className="text-md font-semibold text-white mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-400 text-[20px]">class</span>
                                Kelas Buku Paket <span className="text-red-400 text-sm font-normal">(Wajib dipilih)</span>
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">Pilih kelas peruntukan buku paket mapel ini</p>

                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                {KATEGORI_MAPEL.map(cat => {
                                    const isSelected = formData.kategori === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleCategorySelect(cat.id)}
                                            className={`
                                                relative cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2
                                                transition-all duration-200 select-none text-center
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
                                            <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                                            <span className="font-medium text-xs text-current leading-tight">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {formData.kategori && (
                                <p className="mt-4 text-sm text-slate-400">
                                    Kelas dipilih: <span className="text-white font-medium">{formData.kategori}</span>
                                </p>
                            )}

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h3 className="text-md font-semibold text-white mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-400 text-[20px]">group</span>
                                    Peruntukan <span className="text-red-400 text-sm font-normal">(Wajib dipilih)</span>
                                </h3>
                                <p className="text-slate-400 text-sm mb-4">Pilih peruntukan buku paket ini</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'Siswa', label: 'Siswa', icon: 'school', color: 'indigo' },
                                        { id: 'Guru / Penunjang', label: 'Guru / Penunjang', icon: 'local_library', color: 'teal' }
                                    ].map(peruntukan => {
                                        const isSelected = formData.peruntukan === peruntukan.id;
                                        return (
                                            <button
                                                key={peruntukan.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, peruntukan: peruntukan.id }))}
                                                className={`
                                                    relative cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3
                                                    transition-all duration-200 select-none
                                                    ${isSelected
                                                        ? `${colorMap[peruntukan.color]} shadow-lg scale-[1.02]`
                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                                                    }
                                                `}
                                            >
                                                {isSelected && (
                                                    <span className="absolute top-1.5 right-1.5 material-symbols-outlined text-[14px] text-current">
                                                        check_circle
                                                    </span>
                                                )}
                                                <span className="material-symbols-outlined text-2xl">{peruntukan.icon}</span>
                                                <span className="font-medium text-sm text-current">{peruntukan.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Kategori Buku Umum - only show when Buku Umum selected */}
                    {formData.jenis === 'Buku Umum' && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <h3 className="text-md font-semibold text-white mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-400 text-[20px]">label</span>
                                Kategori Buku Umum <span className="text-red-400 text-sm font-normal">(Wajib dipilih)</span>
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">Pilih kategori yang sesuai dengan isi buku</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {KATEGORI_UMUM.map(cat => {
                                    const isSelected = formData.kategori === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleCategorySelect(cat.id)}
                                            className={`
                                                relative cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2
                                                transition-all duration-200 select-none text-center
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
                                            <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                                            <span className="font-medium text-xs text-current leading-tight">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {formData.kategori && (
                                <p className="mt-4 text-sm text-slate-400">
                                    Kategori dipilih: <span className="text-white font-medium">{formData.kategori}</span>
                                    {' – '}
                                    <span className="text-slate-500">{KATEGORI_UMUM.find(c => c.id === formData.kategori)?.desc}</span>
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Card 3: Kuantitas */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">content_copy</span>
                        Jumlah Buku
                    </h2>
                    <div className="max-w-xs space-y-2">
                        <label className="text-sm font-medium text-slate-300">Kuantitas</label>
                        <input type="number" name="kuantitas" value={formData.kuantitas} onChange={handleChange}
                            min="1" max="500" className={inputClass} />
                        <p className="text-xs text-slate-500">Jika kuantitas {'>'} 1, kode buku akan ditambahkan suffix otomatis (.0001, .0002, dst)</p>
                    </div>

                    {isMultiple && formData.kode_buku && (
                        <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                            <p className="text-sm text-blue-400 font-medium mb-3">
                                Preview: {qty} buku akan dibuat
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                {previewItems.slice(0, 12).map((item, i) => (
                                    <span key={i} className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">
                                        {item.kode_buku}
                                    </span>
                                ))}
                                {qty > 12 && <span className="text-xs text-slate-500">... +{qty - 12} lainnya</span>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/perpustakaan/buku')}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-7 py-3 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Menyimpan {submitProgress.current}/{submitProgress.total}...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">save</span>
                                <span>Simpan Buku</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
};

export default AddLibraryBook;
