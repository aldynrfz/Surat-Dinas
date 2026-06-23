import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await loginUser(email, password);

            if (result.success) {
                // Login successful, navigate to dashboard
                navigate('/');
            } else {
                // Show error message
                setError(result.error);
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display bg-background-light dark:bg-[#121121] min-h-screen flex items-center justify-center relative overflow-hidden text-slate-900 dark:text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-[#121121] pointer-events-none z-0"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-[420px] p-4">
                <div className="flex flex-col w-full bg-white/5 dark:bg-[#1c1b32]/60 backdrop-blur-xl border border-white/10 dark:border-[#383663]/50 rounded-xl shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="flex flex-col items-center pt-10 pb-4 px-8">
                        <div className="bg-primary/20 p-3 rounded-full mb-4">
                            <span className="material-symbols-outlined text-primary text-4xl">school</span>
                        </div>
                        <h1 className="tracking-tight text-3xl font-bold leading-tight text-center">eMANTAP</h1>
                        <p className="text-slate-500 dark:text-[#9795c6] text-sm font-normal leading-normal pt-2 text-center">Selamat datang! Silakan login ke akun Anda.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-8 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="flex flex-col gap-5 px-8 pb-10 w-full">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium leading-normal" htmlFor="email">Alamat Email</label>
                            <input
                                className="w-full rounded-lg bg-white dark:bg-[#121121] border border-slate-200 dark:border-[#383663] text-slate-900 dark:text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 dark:placeholder:text-[#9795c6] transition-all"
                                id="email"
                                placeholder="admin@sekolah.sch.id"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium leading-normal" htmlFor="password">Password</label>
                                <a className="text-primary text-xs font-medium hover:text-primary/80 transition-colors" href="#">Lupa Password?</a>
                            </div>
                            <div className="relative flex w-full items-center">
                                <input
                                    className="w-full rounded-lg bg-white dark:bg-[#121121] border border-slate-200 dark:border-[#383663] text-slate-900 dark:text-white px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 dark:placeholder:text-[#9795c6] transition-all"
                                    id="password"
                                    placeholder="Masukkan password Anda"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 dark:text-[#9795c6] hover:text-primary transition-colors cursor-pointer focus:outline-none"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility' : 'visibility_off'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <label className="flex gap-x-2.5 items-center cursor-pointer group">
                                <input
                                    className="h-4 w-4 rounded border-slate-300 dark:border-[#383663] bg-white dark:bg-transparent text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 focus:outline-none transition-all cursor-pointer accent-primary"
                                    type="checkbox"
                                    disabled={loading}
                                />
                                <p className="text-slate-600 dark:text-[#9795c6] text-sm font-normal leading-normal group-hover:text-white transition-colors">Ingat saya</p>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-sm font-medium leading-normal tracking-[0.015em] hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </span>
                            ) : (
                                <span className="truncate">Masuk</span>
                            )}
                        </button>

                        <div className="text-center mt-2">
                            <p className="text-slate-500 dark:text-[#9795c6] text-xs">
                                Belum punya akun? <Link to="/register" className="text-primary font-medium hover:underline">Daftar Sekarang</Link>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 dark:text-slate-500 text-xs font-medium">© 2024 Surat Dinas System. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
