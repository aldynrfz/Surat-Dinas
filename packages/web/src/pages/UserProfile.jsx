import React, { useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { Camera, User, Mail, Save } from 'lucide-react';
import Toast from '../components/Toast';

const UserProfile = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateProfile(auth.currentUser, {
                displayName: displayName,
                photoURL: photoURL
            });
            showToast('Profil berhasil diperbarui', 'success');
        } catch (error) {
            console.error("Error updating profile:", error);
            showToast('Gagal memperbarui profil: ' + error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-3xl mx-auto flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Profil Pengguna</h1>
                    <p className="text-[#9795c6]">Kelola informasi pribadi dan foto profil Anda.</p>
                </div>

                <div className="glass-panel p-8 rounded-2xl border border-[#272546]">
                    <form onSubmit={handleUpdateProfile} className="flex flex-col gap-8">
                        {/* Photo Upload Section (Simplified for now - URL input or placeholder) */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-[#1c1b2e] border-4 border-[#272546] flex items-center justify-center overflow-hidden">
                                    {photoURL ? (
                                        <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-[#9795c6]" />
                                    )}
                                </div>
                                <button type="button" className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white shadow-lg hover:bg-primary/90 transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="w-full max-w-md">
                                <label className="text-xs text-[#9795c6] font-semibold mb-1 block">Foto Profil (URL)</label>
                                <input
                                    className="w-full px-4 py-2 bg-[#1c1b2e] border border-[#272546] rounded-xl text-white focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                                    value={photoURL}
                                    onChange={(e) => setPhotoURL(e.target.value)} // User pastes URL for now
                                    placeholder="https://example.com/photo.jpg"
                                />
                                <p className="text-[#9795c6] text-xs mt-1">Masukkan URL gambar untuk foto profil.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-white flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" />
                                    Nama Lengkap
                                </label>
                                <input
                                    className="w-full px-4 py-3 bg-[#1c1b2e] border border-[#272546] rounded-xl text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Nama Lengkap Anda"
                                />
                            </div>

                            <div className="flex flex-col gap-2 opacity-70 pointer-events-none">
                                <label className="text-sm font-medium text-white flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    Email Address
                                </label>
                                <input
                                    className="w-full px-4 py-3 bg-[#1c1b2e] border border-[#272546] rounded-xl text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                    value={user?.email || ''}
                                    readOnly
                                />
                                <p className="text-xs text-[#9795c6]">Email tidak dapat diubah.</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#272546] flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
