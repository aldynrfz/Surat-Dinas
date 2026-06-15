import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LeaveRequestLetter = () => {
    const navigate = useNavigate();
    const [leaveType, setLeaveType] = useState('');

    const leaveTypes = [
        { id: 'tahunan', label: 'Cuti Tahunan' },
        { id: 'besar', label: 'Cuti Besar' },
        { id: 'sakit', label: 'Cuti Sakit' },
        { id: 'melahirkan', label: 'Cuti Melahirkan' },
        { id: 'penting', label: 'Cuti Karena Alasan Penting' },
        { id: 'luar_tanggungan', label: 'Cuti di Luar Tanggungan Negara' },
    ];

    return (
        <div className="flex-1 overflow-y-auto z-10 p-6 md:p-10 scroll-smooth">
            <div className="max-w-[960px] mx-auto flex flex-col gap-8">

                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 px-1">
                    <button
                        onClick={() => navigate('/')}
                        className="text-text-secondary text-sm font-medium hover:text-primary transition-colors"
                    >
                        Dashboard
                    </button>
                    <span className="text-text-secondary text-sm font-medium">/</span>
                    <button
                        onClick={() => navigate('/layanan-surat')}
                        className="text-text-secondary text-sm font-medium hover:text-primary transition-colors"
                    >
                        Kepegawaian
                    </button>
                    <span className="text-text-secondary text-sm font-medium">/</span>
                    <span className="text-white text-sm font-medium">Pengajuan Cuti</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-tight">Formulir Pengajuan Cuti Pegawai</h1>
                    <p className="text-text-secondary text-base font-normal">Isi formulir lengkap untuk mengajukan permohonan cuti pegawai sesuai ketentuan yang berlaku.</p>
                </div>

                {/* Search Section */}
                <div className="glass-panel p-6 rounded-2xl">
                    <label className="flex flex-col gap-3">
                        <span className="text-white font-semibold text-sm ml-1">Cari Data Pegawai (Auto-fill)</span>
                        <div className="flex w-full items-stretch rounded-xl h-12 bg-surface-dark focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                            <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="w-full bg-transparent border-none text-white placeholder:text-text-secondary/50 focus:ring-0 text-base h-full px-2"
                                placeholder="Ketik NIP atau Nama Pegawai..."
                            />
                            <div className="pr-2 flex items-center">
                                <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-colors">
                                    CARI
                                </button>
                            </div>
                        </div>
                    </label>
                    <div className="mt-3 flex items-start gap-2 text-xs text-text-secondary px-1">
                        <span className="material-symbols-outlined text-base">info</span>
                        <p>Masukkan NIP untuk memuat data pegawai, jabatan, dan sisa cuti secara otomatis.</p>
                    </div>
                </div>

                <form className="flex flex-col gap-8 pb-12">
                    {/* Data Pegawai */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">badge</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Data Pegawai</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nama Lengkap</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Nama Pegawai" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">NIP</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="NIP Pegawai" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Jabatan</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Jabatan Struktural/Fungsional" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Unit Kerja</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="Unit Kerja" type="text" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Masa Kerja</label>
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="0" type="number" />
                                        <span className="absolute right-4 top-3 text-text-secondary text-sm font-semibold pointer-events-none">Tahun</span>
                                    </div>
                                    <div className="relative flex-1">
                                        <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="0" type="number" />
                                        <span className="absolute right-4 top-3 text-text-secondary text-sm font-semibold pointer-events-none">Bulan</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Nomor HP / WA</label>
                                <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 h-12 px-4 transition-all" placeholder="0812xxxx" type="tel" />
                            </div>
                        </div>
                    </div>

                    {/* Jenis Cuti */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">event_note</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Jenis Cuti</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {leaveTypes.map((type) => (
                                <label key={type.id} className="relative cursor-pointer group">
                                    <input
                                        className="peer sr-only"
                                        name="jenis_cuti"
                                        type="radio"
                                        value={type.id}
                                        checked={leaveType === type.id}
                                        onChange={(e) => setLeaveType(e.target.value)}
                                    />
                                    <div className={`p-4 rounded-xl border transition-all h-full flex items-center justify-between ${leaveType === type.id ? 'border-primary bg-primary/15' : 'border-border-dark bg-surface-dark/30 hover:bg-surface-dark/60'}`}>
                                        <span className="font-medium text-white">{type.label}</span>
                                        <div className={`w-6 h-6 rounded-full bg-primary flex items-center justify-center transition-all ${leaveType === type.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                            <span className="material-symbols-outlined text-white text-sm">check</span>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Detail Pengajuan */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">edit_calendar</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Detail Pengajuan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Alasan Cuti</label>
                                <textarea className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 min-h-[100px] p-4 resize-none transition-all" placeholder="Jelaskan alasan pengajuan cuti..."></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Mulai</label>
                                <div className="relative">
                                    <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all appearance-none" type="date" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">calendar_today</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Tanggal Selesai</label>
                                <div className="relative">
                                    <input className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 transition-all appearance-none" type="date" />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-text-secondary pointer-events-none">calendar_today</span>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-text-secondary text-sm font-medium ml-1">Alamat Selama Menjalankan Cuti</label>
                                <textarea className="w-full bg-background-dark text-white rounded-xl border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary/30 min-h-[80px] p-4 resize-none transition-all" placeholder="Alamat lengkap..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Catatan Cuti */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">history</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Catatan Cuti (Tahun N)</h3>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-border-dark">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs text-white uppercase bg-surface-dark">
                                    <tr>
                                        <th className="px-6 py-3" scope="col">Tahun</th>
                                        <th className="px-6 py-3" scope="col">Sisa Cuti</th>
                                        <th className="px-6 py-3" scope="col">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-dark bg-[#1d1b36]">
                                    <tr>
                                        <td className="px-6 py-4">N-2</td>
                                        <td className="px-6 py-4"><input className="w-20 bg-surface-dark border-none rounded text-white text-center h-8" type="number" defaultValue="0" /></td>
                                        <td className="px-6 py-4"> - </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4">N-1</td>
                                        <td className="px-6 py-4"><input className="w-20 bg-surface-dark border-none rounded text-white text-center h-8" type="number" defaultValue="6" /></td>
                                        <td className="px-6 py-4"> - </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4">N (Tahun Berjalan)</td>
                                        <td className="px-6 py-4"><input className="w-20 bg-surface-dark border-none rounded text-white text-center h-8" type="number" defaultValue="12" /></td>
                                        <td className="px-6 py-4"> - </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Penandatanganan */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined">ink_pen</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">Penandatanganan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4 p-4 rounded-xl border border-border-dark bg-surface-dark/20">
                                <h4 className="text-white font-semibold text-center border-b border-border-dark pb-2">Pegawai Yang Mengajukan</h4>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-xs">Nama</label>
                                    <input className="w-full bg-surface-dark text-white rounded-lg border-transparent text-sm h-10 px-3" readOnly defaultValue="(Auto) Nama Pegawai" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-xs">NIP</label>
                                    <input className="w-full bg-surface-dark text-white rounded-lg border-transparent text-sm h-10 px-3" readOnly defaultValue="(Auto) NIP" />
                                </div>
                            </div>
                            <div className="space-y-4 p-4 rounded-xl border border-border-dark bg-surface-dark/20">
                                <h4 className="text-white font-semibold text-center border-b border-border-dark pb-2">Kepala Madrasah</h4>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-xs">Nama</label>
                                    <select className="w-full bg-surface-dark text-white rounded-lg border-transparent text-sm h-10 px-3 cursor-pointer">
                                        <option>Drs. H. Muhammad Ilham, M.Pd.</option>
                                        <option>Hj. Siti Aminah, S.Ag.</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-xs">NIP</label>
                                    <input className="w-full bg-surface-dark text-white rounded-lg border-transparent text-sm h-10 px-3" defaultValue="19750502 200501 1 008" />
                                </div>
                            </div>
                            <div className="space-y-4 p-4 rounded-xl border border-border-dark bg-surface-dark/20">
                                <h4 className="text-white font-semibold text-center border-b border-border-dark pb-2">Pejabat Berwenang</h4>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-xs">Nama</label>
                                    <input className="w-full bg-surface-dark text-white rounded-lg border-transparent text-sm h-10 px-3" placeholder="Nama Pejabat" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-text-secondary text-xs">NIP</label>
                                    <input className="w-full bg-surface-dark text-white rounded-lg border-transparent text-sm h-10 px-3" placeholder="NIP Pejabat" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/layanan-surat')}
                            className="h-12 px-8 rounded-xl border border-border-dark text-text-secondary font-bold hover:text-white hover:bg-surface-dark transition-all"
                        >
                            Batalkan
                        </button>
                        <button
                            type="submit"
                            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[20px]">print</span>
                            Generate Surat
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveRequestLetter;
