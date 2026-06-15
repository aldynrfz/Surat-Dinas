import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AddStudent = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-24">
            <div className="max-w-[1000px] mx-auto flex flex-col gap-6">

                {/* Page Heading */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Registrasi Siswa Baru</h1>
                    <p className="text-[#9795c6] text-base">Silakan isi formulir di bawah ini dengan data yang benar dan lengkap.</p>
                </div>

                {/* Form Card */}
                <form className="glass-panel p-6 md:p-8 rounded-2xl border border-[#272546] flex flex-col gap-8">

                    {/* Section 1: Informasi Pribadi */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-[#272546] pb-2">
                            <span className="material-symbols-outlined text-primary">person</span>
                            <h3 className="text-white text-lg font-bold leading-tight">Informasi Pribadi</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-2">
                            {/* Nama Lengkap */}
                            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Nama Lengkap</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Masukkan nama lengkap siswa" type="text" />
                            </div>
                            {/* NIS */}
                            <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">NIS</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Nomor Induk Siswa" type="text" />
                            </div>
                            {/* NISN */}
                            <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">NISN</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Nomor Induk Siswa Nasional" type="text" />
                            </div>
                            {/* Tempat Lahir */}
                            <div className="col-span-1 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Tempat Lahir</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Kota kelahiran" type="text" />
                            </div>
                            {/* Tanggal Lahir */}
                            <div className="col-span-1 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Tanggal Lahir</label>
                                <div className="relative">
                                    <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none appearance-none" type="date" />
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#9795c6]">
                                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Section 2: Data Orang Tua */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-[#272546] pb-2">
                            <span className="material-symbols-outlined text-primary">family_restroom</span>
                            <h3 className="text-white text-lg font-bold leading-tight">Data Orang Tua/Wali</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-2">
                            {/* Ayah */}
                            <div className="col-span-1 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Nama Ayah</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Nama Ayah Kandung" type="text" />
                            </div>
                            <div className="col-span-1 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Pekerjaan Ayah</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Pekerjaan Ayah" type="text" />
                            </div>
                            {/* Ibu */}
                            <div className="col-span-1 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Nama Ibu</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Nama Ibu Kandung" type="text" />
                            </div>
                            <div className="col-span-1 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Pekerjaan Ibu</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Pekerjaan Ibu" type="text" />
                            </div>
                            {/* Wali */}
                            <div className="col-span-1 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Nama Wali <span className="text-[#9795c6] font-normal">(Opsional)</span></label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Nama Wali" type="text" />
                            </div>
                            <div className="col-span-1 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Pekerjaan Wali <span className="text-[#9795c6] font-normal">(Opsional)</span></label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Pekerjaan Wali" type="text" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Alamat Lengkap */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-[#272546] pb-2">
                            <span className="material-symbols-outlined text-primary">home_pin</span>
                            <h3 className="text-white text-lg font-bold leading-tight">Alamat Lengkap</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 pt-2">
                            {/* Alamat Jalan */}
                            <div className="col-span-1 md:col-span-2 lg:col-span-6 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Alamat Jalan</label>
                                <textarea className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px] p-4 placeholder:text-[#9795c6]/50 transition-all outline-none resize-none" placeholder="Nama jalan, nomor rumah, gang, dll."></textarea>
                            </div>
                            {/* RT/RW */}
                            <div className="col-span-1 lg:col-span-2 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">RT / RW</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="001 / 002" type="text" />
                            </div>
                            {/* Kode Pos */}
                            <div className="col-span-1 lg:col-span-1 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Kode Pos</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="XXXXX" type="text" />
                            </div>
                            {/* Desa/Kelurahan */}
                            <div className="col-span-1 lg:col-span-3 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Desa / Kelurahan</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Nama Desa" type="text" />
                            </div>
                            {/* Kecamatan */}
                            <div className="col-span-1 lg:col-span-2 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Kecamatan</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Kecamatan" type="text" />
                            </div>
                            {/* Kab/Kota */}
                            <div className="col-span-1 lg:col-span-2 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Kabupaten / Kota</label>
                                <input className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none" placeholder="Kabupaten" type="text" />
                            </div>
                            {/* Provinsi */}
                            <div className="col-span-1 lg:col-span-2 flex flex-col gap-2">
                                <label className="text-white text-sm font-medium">Provinsi</label>
                                <div className="relative">
                                    <select className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-all outline-none appearance-none cursor-pointer">
                                        <option disabled defaultValue="" value="">Pilih Provinsi</option>
                                        <option value="Jawa Barat">Jawa Barat</option>
                                        <option value="Jawa Tengah">Jawa Tengah</option>
                                        <option value="Jawa Timur">Jawa Timur</option>
                                        <option value="DKI Jakarta">DKI Jakarta</option>
                                        <option value="DI Yogyakarta">DI Yogyakarta</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#9795c6]">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 pt-6 border-t border-[#272546]">
                        <button
                            className="w-full sm:w-auto px-6 py-3 rounded-xl text-[#9795c6] font-bold hover:bg-[#272546] hover:text-white transition-colors"
                            type="button"
                            onClick={() => navigate('/data-siswa')}
                        >
                            Batal
                        </button>
                        <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl px-12 py-3 font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2" type="button">
                            <span className="material-symbols-outlined">save</span>
                            Simpan Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudent;
