import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AddEmployee = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-24">
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6">



                {/* Page Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Personnel Registration</h1>
                    <p className="text-[#9795c6] text-base max-w-2xl">
                        Create a new personnel record. Please ensure all identity and employment details are accurate before saving.
                    </p>
                </div>

                {/* Form Card */}
                <div className="w-full max-w-4xl mx-auto mt-4">
                    <div className="glass-panel rounded-2xl overflow-hidden border border-[#272546]">
                        {/* Card Header */}
                        <div className="bg-[#1c1b2e]/50 px-6 py-4 border-b border-[#272546] flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <span className="material-symbols-outlined text-primary">person_add</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">New Personnel Data</h3>
                                <p className="text-xs text-[#9795c6]">Fill in the required information below</p>
                            </div>
                        </div>

                        <form className="p-6 md:p-8 flex flex-col gap-8">
                            {/* Section 1: Identitas Pegawai */}
                            <section>
                                <div className="flex items-center gap-2 mb-6 border-b border-[#272546] pb-2">
                                    <h6 className="text-primary font-bold text-sm uppercase tracking-wider">Identitas Pegawai</h6>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-white mb-1.5" htmlFor="fullName">Nama Lengkap</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-[#9795c6] text-[20px]">badge</span>
                                            </div>
                                            <input
                                                className="block w-full pl-10 pr-3 py-2.5 border border-[#272546] rounded-xl bg-[#131221] text-white placeholder-[#9795c6]/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all sm:text-sm"
                                                id="fullName"
                                                name="fullName"
                                                placeholder="e.g. Dr. Budi Santoso, M.Pd"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-white mb-1.5" htmlFor="nip">NIP (Nomor Induk Pegawai)</label>
                                        <input
                                            className="block w-full px-3 py-2.5 border border-[#272546] rounded-xl bg-[#131221] text-white placeholder-[#9795c6]/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all sm:text-sm font-mono"
                                            id="nip"
                                            name="nip"
                                            placeholder="19850101 201001 1 001"
                                            type="text"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-white mb-1.5" htmlFor="email">Email Pribadi</label>
                                        <input
                                            className="block w-full px-3 py-2.5 border border-[#272546] rounded-xl bg-[#131221] text-white placeholder-[#9795c6]/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all sm:text-sm"
                                            id="email"
                                            name="email"
                                            placeholder="name@example.com"
                                            type="email"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Detail Kepegawaian */}
                            <section>
                                <div className="flex items-center gap-2 mb-6 border-b border-[#272546] pb-2">
                                    <h6 className="text-primary font-bold text-sm uppercase tracking-wider">Detail Kepegawaian</h6>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                        <label className="block text-sm font-medium text-white mb-1.5" htmlFor="position">Jabatan (Position)</label>
                                        <select
                                            className="block w-full px-3 py-2.5 border border-[#272546] rounded-xl bg-[#131221] text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all sm:text-sm appearance-none cursor-pointer"
                                            id="position"
                                            name="position"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Pilih Jabatan...</option>
                                            <option value="kepala_sekolah">Kepala Sekolah</option>
                                            <option value="wakil_kurikulum">Wakil Kepala Sekolah (Kurikulum)</option>
                                            <option value="guru_mapel">Guru Mata Pelajaran</option>
                                            <option value="staf_tu">Staf Tata Usaha</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-white mb-1.5" htmlFor="rank">Pangkat</label>
                                        <div className="relative">
                                            <input
                                                className="block w-full px-3 py-2.5 border border-[#272546] rounded-xl bg-[#131221] text-white placeholder-[#9795c6]/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all sm:text-sm"
                                                id="rank"
                                                list="rankList"
                                                name="rank"
                                                placeholder="e.g. Penata Muda"
                                                type="text"
                                            />
                                            <datalist id="rankList">
                                                <option value="Pengatur Muda"></option>
                                                <option value="Pengatur"></option>
                                                <option value="Penata Muda"></option>
                                                <option value="Penata"></option>
                                                <option value="Pembina"></option>
                                            </datalist>
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-white mb-1.5" htmlFor="classGroup">Golongan Ruang</label>
                                        <select
                                            className="block w-full px-3 py-2.5 border border-[#272546] rounded-xl bg-[#131221] text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all sm:text-sm cursor-pointer"
                                            id="classGroup"
                                            name="classGroup"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Pilih Golongan...</option>
                                            <option value="III/a">III/a</option>
                                            <option value="III/b">III/b</option>
                                            <option value="III/c">III/c</option>
                                            <option value="III/d">III/d</option>
                                            <option value="IV/a">IV/a</option>
                                            <option value="IV/b">IV/b</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-white mb-1.5" htmlFor="status">Status</label>
                                        <select
                                            className="block w-full px-3 py-2.5 border border-[#272546] rounded-xl bg-[#131221] text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all sm:text-sm cursor-pointer"
                                            id="status"
                                            name="status"
                                            defaultValue="pns"
                                        >
                                            <option value="pns">PNS</option>
                                            <option value="pppk">PPPK</option>
                                            <option value="honorer">Honorer</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <div className="pt-6 border-t border-[#272546] flex flex-col-reverse md:flex-row gap-4 md:justify-end">
                                <button
                                    className="w-full md:w-auto px-6 py-2.5 rounded-xl border border-[#272546] text-[#9795c6] font-semibold hover:bg-[#272546] hover:text-white transition-colors"
                                    type="button"
                                    onClick={() => navigate('/pegawai')}
                                >
                                    Batal
                                </button>
                                <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl shadow-lg shadow-primary/25 transition-all transform active:scale-95 font-bold tracking-wide" type="submit">
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    Simpan Data Pegawai
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEmployee;
