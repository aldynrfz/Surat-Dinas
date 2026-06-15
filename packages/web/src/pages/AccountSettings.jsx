import React, { useState } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { Lock, Save } from 'lucide-react';
import Toast from '../components/Toast';

const AccountSettings = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showToast('Konfirmasi password tidak cocok', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('Password baru minimal 6 karakter', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Re-authenticate user first (required for sensitive operations)
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            showToast('Password berhasil diubah', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Error changing password:", error);
            if (error.code === 'auth/wrong-password') {
                showToast('Password saat ini salah', 'error');
            } else {
                showToast('Gagal mengubah password: ' + error.message, 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-2xl mx-auto flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Pengaturan Akun</h1>
                    <p className="text-[#9795c6]">Amankan akun Anda dengan memperbarui kata sandi secara berkala.</p>
                </div>

                <div className="glass-panel p-8 rounded-2xl border border-[#272546]">
                    <form onSubmit={handleChangePassword} className="flex flex-col gap-6">

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                                <Lock className="w-4 h-4 text-[#9795c6]" />
                                Password Saat Ini
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-[#1c1b2e] border border-[#272546] rounded-xl text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Masukkan password lama"
                                required
                            />
                        </div>

                        <div className="h-px bg-[#272546] my-2"></div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                                <Lock className="w-4 h-4 text-primary" />
                                Password Baru
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-[#1c1b2e] border border-[#272546] rounded-xl text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white flex items-center gap-2">
                                <Lock className="w-4 h-4 text-primary" />
                                Konfirmasi Password Baru
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-[#1c1b2e] border border-[#272546] rounded-xl text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Ulangi password baru"
                                required
                            />
                        </div>

                        <div className="pt-4 mt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>Verifying...</>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Ganti Password
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

export default AccountSettings;
