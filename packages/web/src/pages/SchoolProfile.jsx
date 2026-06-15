import React, { useState, useEffect } from 'react';
import { useSchool } from '../contexts/SchoolContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

const SchoolProfile = () => {
    const { schoolData, loading, updateSchool } = useSchool();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nama_madrasah: '',
        nama_madrasah_lengkap: '',
        nsm: '',
        alamat_madrasah: '',
        email_madrasah: '',
        no_telp: '',
        logo_url: '',
        nama_kepala_madrasah: '',
        nip_kepala_madrasah: '',
        nama_kaur_tu: '',
        nip_kaur_tu_: '',
    });

    const [toast, setToast] = useState(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        if (schoolData) {
            setFormData(prev => ({
                ...prev,
                ...schoolData
            }));
        }
    }, [schoolData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSchool(formData);
            showToast('Data sekolah berhasil disimpan', 'success');
        } catch (error) {
            console.error("Failed to save:", error);
            showToast('Gagal menyimpan data', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            showToast('Berhasil keluar', 'success');
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
            showToast('Gagal logout', 'error');
            setIsLoggingOut(false);
            setIsLogoutModalOpen(false);
        }
    };

    // Format Last Active
    const lastActive = user?.metadata?.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })
        : 'Baru saja';

    if (loading) {
        return <div className="p-10 text-white text-center">Memuat data profil...</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto z-10 p-4 md:p-10 lg:px-40 scroll-smooth">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title="Konfirmasi Logout"
                message="Apakah Anda yakin ingin keluar dari aplikasi?"
                type="danger"
                isLoading={isLoggingOut}
            />

            <div className="w-full max-w-[1120px] mx-auto flex flex-col md:flex-row gap-8 items-start">

                {/* Left Column */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    {/* Profile Card */}
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>
                        <div className="relative z-10 mb-4">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full size-32 border-4 border-border-dark shadow-xl bg-slate-700"
                                style={{ backgroundImage: formData.logo_url ? `url("${formData.logo_url}")` : 'none' }}>
                                {!formData.logo_url && <span className="flex items-center justify-center h-full text-4xl text-white/50 font-bold">{formData.nama_madrasah?.charAt(0) || 'S'}</span>}
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-white text-xl font-bold leading-tight mb-1">{formData.nama_madrasah || 'Nama Madrasah'}</h2>
                            <span className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded-full border border-primary/20 mb-3">
                                Verified School
                            </span>
                            <p className="text-text-secondary text-sm font-normal mb-1">NSM: {formData.nsm || '-'}</p>
                            <p className="text-text-secondary text-sm font-normal flex items-center justify-center gap-1 text-center px-4">
                                <span className="material-symbols-outlined text-sm shrink-0">location_on</span>
                                <span className="line-clamp-2">{formData.alamat_madrasah || '-'}</span>
                            </p>
                        </div>
                        <div className="w-full h-px bg-border-dark my-6"></div>
                        <div className="w-full flex flex-col gap-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Status</span>
                                <span className="text-green-400 font-medium flex items-center gap-1"><span className="size-2 rounded-full bg-green-500"></span> Active</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Last Active</span>
                                <span className="text-white text-xs">{lastActive}</span>
                            </div>
                        </div>
                    </div>

                    {/* Helper Card */}
                    <div className="bg-gradient-to-br from-primary to-violet-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] opacity-20">support_agent</span>
                        <h3 className="text-lg font-bold mb-2 relative z-10">Butuh Bantuan?</h3>
                        <p className="text-white/80 text-sm mb-4 relative z-10">Hubungi tim support kami jika terdapat kendala teknis.</p>
                        <a
                            href="https://wa.me/082127513184"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 w-fit"
                        >
                            <span className="material-symbols-outlined text-lg">chat</span> Hubungi Support
                        </a>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full md:w-2/3 flex flex-col gap-6">
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-8 shadow-lg">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h1 className="text-white text-2xl font-bold tracking-tight">Profil Sekolah</h1>
                                <p className="text-text-secondary text-sm mt-1">Kelola data utama madrasah dan pejabat.</p>
                            </div>
                            {/* Removed Settings and Theme Toggle as requested */}
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 gap-6">
                                <label className="flex flex-col gap-2 group">
                                    <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">Nama Madrasah</span>
                                    <input
                                        name="nama_madrasah"
                                        value={formData.nama_madrasah}
                                        onChange={handleInputChange}
                                        className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50"
                                        placeholder="Contoh: MTSN 11 TASIKMALAYA"
                                        type="text"
                                        required
                                    />
                                </label>

                                <label className="flex flex-col gap-2 group">
                                    <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">Nama Madrasah Lengkap</span>
                                    <input
                                        name="nama_madrasah_lengkap"
                                        value={formData.nama_madrasah_lengkap}
                                        onChange={handleInputChange}
                                        className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50"
                                        placeholder="Contoh: MADRASAH TSANAWIYAH NEGERI 11 TASIKMALAYA"
                                        type="text"
                                    />
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="flex flex-col gap-2 group">
                                        <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">NSM (Nomor Statistik Madrasah)</span>
                                        <input
                                            name="nsm"
                                            value={formData.nsm}
                                            onChange={handleInputChange}
                                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50"
                                            placeholder="Nomor Statistik"
                                            type="text"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-2 group">
                                        <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">URL Logo Sekolah</span>
                                        <div className="relative">
                                            <input
                                                name="logo_url"
                                                value={formData.logo_url}
                                                onChange={handleInputChange}
                                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50"
                                                placeholder="https://..."
                                                type="text"
                                            />
                                            <span className="material-symbols-outlined absolute right-4 top-3.5 text-text-secondary pointer-events-none">image</span>
                                        </div>
                                    </label>
                                </div>

                                <label className="flex flex-col gap-2 group">
                                    <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">Alamat Lengkap</span>
                                    <textarea
                                        name="alamat_madrasah"
                                        value={formData.alamat_madrasah}
                                        onChange={handleInputChange}
                                        className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50 resize-y"
                                        placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kab, Provinsi, Kode Pos"
                                        rows="3"
                                    ></textarea>
                                </label>
                                <label className="flex flex-col gap-2 group">
                                    <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">No. Telepon / WhatsApp</span>
                                    <input
                                        name="no_telp"
                                        value={formData.no_telp}
                                        onChange={handleInputChange}
                                        className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50"
                                        placeholder="Contoh: 08123456789"
                                        type="tel"
                                    />
                                </label>
                                <label className="flex flex-col gap-2 group">
                                    <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">Alamat Email Madrasah</span>
                                    <input
                                        name="email_madrasah"
                                        value={formData.email_madrasah}
                                        onChange={handleInputChange}
                                        className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50"
                                        placeholder="Contoh: madrasah@email.com"
                                        type="email"
                                    />
                                </label>
                            </div>

                            <div className="h-px bg-border-dark w-full my-2"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Kepala Madrasah */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-white text-lg font-bold">Kepala Madrasah</h3>
                                    <label className="flex flex-col gap-2 group">
                                        <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">Nama Lengkap</span>
                                        <input
                                            name="nama_kepala_madrasah"
                                            value={formData.nama_kepala_madrasah}
                                            onChange={handleInputChange}
                                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50"
                                            placeholder="Nama Kepala Madrasah"
                                            type="text"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-2 group">
                                        <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">NIP</span>
                                        <input
                                            name="nip_kepala_madrasah"
                                            value={formData.nip_kepala_madrasah}
                                            onChange={handleInputChange}
                                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50"
                                            placeholder="NIP Kepala Madrasah"
                                            type="text"
                                        />
                                    </label>
                                </div>

                                {/* Kaur TU */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-white text-lg font-bold">Kaur Tata Usaha</h3>
                                    <label className="flex flex-col gap-2 group">
                                        <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">Nama Lengkap</span>
                                        <input
                                            name="nama_kaur_tu"
                                            value={formData.nama_kaur_tu}
                                            onChange={handleInputChange}
                                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50"
                                            placeholder="Nama Kaur TU"
                                            type="text"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-2 group">
                                        <span className="text-white text-sm font-medium group-focus-within:text-primary transition-colors">NIP</span>
                                        <input
                                            name="nip_kaur_tu_"
                                            value={formData.nip_kaur_tu_}
                                            onChange={handleInputChange}
                                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50"
                                            placeholder="NIP Kaur TU"
                                            type="text"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 mt-2">
                                <button
                                    className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all text-sm font-semibold flex items-center gap-2 group"
                                    type="button"
                                    onClick={handleLogoutClick}
                                >
                                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">logout</span>
                                    Logout
                                </button>
                                <div className="flex items-center gap-4">
                                    <button
                                        className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        type="submit"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-lg">save</span>
                                                <span>Simpan Perubahan</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolProfile;
