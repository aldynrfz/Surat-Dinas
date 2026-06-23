import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';
import { Indonesian } from 'flatpickr/dist/l10n/id.js';
import 'flatpickr/dist/themes/dark.css';
import Toast from '../components/Toast';
// Asumsikan getAllStudents mengekspor sesuatu atau kita bisa buat getStudentById jika belum ada.
// Karena kita tidak yakin ada getStudentById di dataService, kita gunakan getDocs dan cari id, atau tambah method.
import { addStudent, updateStudent } from '../services/dataService';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const dropdownOptions = {
    agama: ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Kong Hu Cu'],
    citaCita: ['PNS', 'Guru/Dosen', 'Dokter', 'Politikus', 'Wiraswasta', 'Seniman/Artis', 'Ilmuwan', 'Agamawan', 'Lainnya'],
    hobi: ['Olahraga', 'Kesenian', 'Membaca', 'Menulis', 'Jalan-jalan', 'Lainnya'],
    statusOrtu: ['Masih Hidup', 'Sudah Meninggal', 'Tidak Diketahui'],
    pendidikan: ['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1', 'D2', 'D3', 'D4/S1', 'S2', 'S3', 'Tidak Bersekolah', 'Lainnya'],
    pekerjaan: ['Belum/tidak bekerja', 'Buruh harian lepas', 'Wiraswasta', 'Pedagang', 'PNS', 'Guru/Dosen', 'Karyawan swasta', 'Perangkat desa', 'Sopir', 'Arsitek', 'Montir', 'Petani/Peternak/Nelayan', 'Pensiunan', 'Polri', 'TNI', 'Karyawan honorer', 'Agamawan/Ustad/Guru Ngaji', 'Lainnya'],
    penghasilan: [
        'dibawah 800.000', '800.000 - 1.200.000', '1.200.000 - 1.800.000',
        '1.800.000 - 2.500.000', '2.500.000 - 3.500.000', '3.500.000 - 4.800.000',
        '4.800.000 - 6.500.000', '6.500.000 - 10.000.000', '10.000.000 - 20.000.000', 'diatas 20.000.000'
    ],
    jarak: ['kurang dari 5 Km', 'Antara 5-10 Km', 'Antara 11-20 Km', 'Antara 21-30 Km', 'Lebih dari 30 Km'],
    transportasi: ['Jalan Kaki', 'Sepeda Motor', 'Mobil Pribadi', 'Antar Jemput Sekolah', 'Angkutan Umum', 'Perahu/Sampan', 'Kereta Api', 'Ojek', 'Andong/Bendi/Sado/Dokar/Delman/Becak'],
    waktuTempuh: ['1-10 menit', '10-19 menit', '20-29 menit', '30-39 menit', '1-2 jam', '> 2 jam']
};

const initialFormState = {
    name: '', nis: '', nisn: '', placeOfBirth: '', dateOfBirth: '', gender: 'L',
    anakKe: '', jumlahSaudara: '', agama: '', citaCita: '', hobi: '',
    noKk: '', nikSiswa: '', phone: '', email: '',
    
    ayahNik: '', ayahNama: '', ayahStatus: '', ayahTempatLahir: '', ayahTanggalLahir: '', ayahPendidikan: '', ayahPekerjaan: '',
    
    ibuNik: '', ibuNama: '', ibuStatus: '', ibuTempatLahir: '', ibuTanggalLahir: '', ibuPendidikan: '', ibuPekerjaan: '',
    
    waliNik: '', waliNama: '', waliTempatLahir: '', waliTanggalLahir: '', waliPendidikan: '', waliPekerjaan: '',
    
    penghasilanOrtu: '', linkKk: '',
    
    address: '', rt: '', rw: '', village: '', district: '', city: '', province: '', postalCode: '',
    jarakMadrasah: '', transportasi: '', waktuTempuh: ''
};

const SelectField = ({ label, name, options, value, onChange }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs text-[#9795c6] font-semibold">{label}</label>
        <div className="relative">
            <select 
                name={name} 
                value={value || ''} 
                onChange={onChange}
                className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 transition-all outline-none appearance-none cursor-pointer text-sm"
            >
                <option value="" disabled>Pilih {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#9795c6]">
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
        </div>
    </div>
);

const InputField = ({ label, name, type = 'text', value, onChange, placeholder, ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs text-[#9795c6] font-semibold">{label}</label>
        <input 
            name={name} 
            type={type} 
            value={value || ''} 
            onChange={onChange} 
            placeholder={placeholder}
            className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none text-sm"
            {...props}
        />
    </div>
);

const DateField = ({ label, name, value, onChange }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs text-[#9795c6] font-semibold">{label}</label>
        <div className="relative">
            <Flatpickr
                value={value || ''}
                onChange={(date) => onChange(date, name)}
                options={{ dateFormat: "Y-m-d", locale: Indonesian, altInput: true, altFormat: "d F Y" }}
                placeholder={`Pilih ${label}`}
                className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none appearance-none text-sm cursor-pointer"
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#9795c6]">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </div>
        </div>
    </div>
);

const StudentForm = ({ mode }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (mode === 'edit' && id) {
            const fetchStudent = async () => {
                setIsLoadingData(true);
                try {
                    const docRef = doc(db, 'students', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setFormData({ ...initialFormState, ...docSnap.data() });
                    } else {
                        showToast("Siswa tidak ditemukan", "error");
                        setTimeout(() => navigate('/data-siswa'), 2000);
                    }
                } catch (error) {
                    showToast("Gagal mengambil data siswa", "error");
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchStudent();
        } else {
            setFormData(initialFormState);
        }
    }, [mode, id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date, name) => {
        if (date.length > 0) {
            const d = date[0];
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            setFormData(prev => ({ ...prev, [name]: `${year}-${month}-${day}` }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (mode === 'add') {
                await addStudent(formData);
                showToast("Siswa berhasil ditambahkan", "success");
            } else {
                await updateStudent(id, formData);
                showToast("Siswa berhasil diperbarui", "success");
            }
            setTimeout(() => navigate('/data-siswa'), 1500);
        } catch (error) {
            showToast("Gagal menyimpan data: " + error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };



    if (isLoadingData) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        {mode === 'add' ? 'Registrasi Siswa Baru' : 'Edit Data Siswa'}
                    </h1>
                    <p className="text-[#9795c6] text-base">
                        {mode === 'add' ? 'Silakan isi formulir di bawah ini dengan data lengkap dan valid.' : 'Perbarui data siswa dengan informasi terbaru.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    
                    {/* SECTION: DATA SISWA */}
                    <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#272546] flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-[#272546] pb-3">
                            <span className="material-symbols-outlined text-primary text-[24px]">person</span>
                            <h3 className="text-white text-lg font-bold">Data Pribadi Siswa</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            <div className="lg:col-span-2 xl:col-span-2"><InputField label="Nama Lengkap" name="name" value={formData.name} onChange={handleChange} /></div>
                            <InputField label="NIS" name="nis" value={formData.nis} onChange={handleChange} />
                            <InputField label="NISN" name="nisn" value={formData.nisn} onChange={handleChange} />
                            
                            <InputField label="NIK Siswa" name="nikSiswa" value={formData.nikSiswa} onChange={handleChange} />
                            <InputField label="No. Kartu Keluarga" name="noKk" value={formData.noKk} onChange={handleChange} />
                            <InputField label="Tempat Lahir" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} />
                            <DateField label="Tanggal Lahir" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleDateChange} />
                            
                            <SelectField label="Jenis Kelamin" name="gender" options={['L', 'P']} value={formData.gender} onChange={handleChange} />
                            <SelectField label="Agama" name="agama" options={dropdownOptions.agama} value={formData.agama} onChange={handleChange} />
                            <InputField label="Anak Ke" name="anakKe" type="number" value={formData.anakKe} onChange={handleChange} />
                            <InputField label="Jumlah Saudara" name="jumlahSaudara" type="number" value={formData.jumlahSaudara} onChange={handleChange} />
                            
                            <SelectField label="Cita-cita" name="citaCita" options={dropdownOptions.citaCita} value={formData.citaCita} onChange={handleChange} />
                            <SelectField label="Hobi" name="hobi" options={dropdownOptions.hobi} value={formData.hobi} onChange={handleChange} />
                            <InputField label="No. Handphone" name="phone" value={formData.phone} onChange={handleChange} />
                            <InputField label="Alamat Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                            
                            {/* Upload KK */}
                            <div className="lg:col-span-2 xl:col-span-2 flex flex-col gap-1.5">
                                <label className="text-xs text-[#9795c6] font-semibold">Link Dokumen KK (G-Drive)</label>
                                <div className="flex gap-2">
                                    <input 
                                        name="linkKk" 
                                        value={formData.linkKk || ''} 
                                        onChange={handleChange} 
                                        placeholder="Tempel tautan Google Drive di sini"
                                        className="flex-1 rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 placeholder:text-[#9795c6]/50 transition-all outline-none text-sm"
                                    />
                                    {formData.linkKk && (
                                        <button 
                                            type="button" 
                                            onClick={() => window.open(formData.linkKk, '_blank', 'noopener,noreferrer')}
                                            className="px-4 h-11 bg-[#272546] hover:bg-[#323055] text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            Lihat
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: DATA ORANG TUA / AYAH */}
                    <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#272546] flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-[#272546] pb-3">
                            <span className="material-symbols-outlined text-blue-400 text-[24px]">man</span>
                            <h3 className="text-white text-lg font-bold">Data Ayah Kandung</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <InputField label="NIK Ayah" name="ayahNik" value={formData.ayahNik} onChange={handleChange} />
                            <InputField label="Nama Lengkap Ayah" name="ayahNama" value={formData.ayahNama} onChange={handleChange} />
                            <SelectField label="Status Ayah" name="ayahStatus" options={dropdownOptions.statusOrtu} value={formData.ayahStatus} onChange={handleChange} />
                            
                            <InputField label="Tempat Lahir Ayah" name="ayahTempatLahir" value={formData.ayahTempatLahir} onChange={handleChange} />
                            <DateField label="Tanggal Lahir Ayah" name="ayahTanggalLahir" value={formData.ayahTanggalLahir} onChange={handleDateChange} />
                            <SelectField label="Pendidikan Terakhir" name="ayahPendidikan" options={dropdownOptions.pendidikan} value={formData.ayahPendidikan} onChange={handleChange} />
                            <SelectField label="Pekerjaan" name="ayahPekerjaan" options={dropdownOptions.pekerjaan} value={formData.ayahPekerjaan} onChange={handleChange} />
                        </div>
                    </div>

                    {/* SECTION: DATA IBU */}
                    <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#272546] flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-[#272546] pb-3">
                            <span className="material-symbols-outlined text-pink-400 text-[24px]">woman</span>
                            <h3 className="text-white text-lg font-bold">Data Ibu Kandung</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <InputField label="NIK Ibu" name="ibuNik" value={formData.ibuNik} onChange={handleChange} />
                            <InputField label="Nama Lengkap Ibu" name="ibuNama" value={formData.ibuNama} onChange={handleChange} />
                            <SelectField label="Status Ibu" name="ibuStatus" options={dropdownOptions.statusOrtu} value={formData.ibuStatus} onChange={handleChange} />
                            
                            <InputField label="Tempat Lahir Ibu" name="ibuTempatLahir" value={formData.ibuTempatLahir} onChange={handleChange} />
                            <DateField label="Tanggal Lahir Ibu" name="ibuTanggalLahir" value={formData.ibuTanggalLahir} onChange={handleDateChange} />
                            <SelectField label="Pendidikan Terakhir" name="ibuPendidikan" options={dropdownOptions.pendidikan} value={formData.ibuPendidikan} onChange={handleChange} />
                            <SelectField label="Pekerjaan" name="ibuPekerjaan" options={dropdownOptions.pekerjaan} value={formData.ibuPekerjaan} onChange={handleChange} />
                        </div>
                    </div>

                    {/* SECTION: DATA WALI & PENGHASILAN */}
                    <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#272546] flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-[#272546] pb-3">
                            <span className="material-symbols-outlined text-amber-400 text-[24px]">shield_person</span>
                            <h3 className="text-white text-lg font-bold">Data Wali & Penghasilan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <InputField label="NIK Wali" name="waliNik" value={formData.waliNik} onChange={handleChange} />
                            <InputField label="Nama Lengkap Wali" name="waliNama" value={formData.waliNama} onChange={handleChange} />
                            <InputField label="Tempat Lahir Wali" name="waliTempatLahir" value={formData.waliTempatLahir} onChange={handleChange} />
                            
                            <DateField label="Tanggal Lahir Wali" name="waliTanggalLahir" value={formData.waliTanggalLahir} onChange={handleDateChange} />
                            <SelectField label="Pendidikan Terakhir" name="waliPendidikan" options={dropdownOptions.pendidikan} value={formData.waliPendidikan} onChange={handleChange} />
                            <SelectField label="Pekerjaan Wali" name="waliPekerjaan" options={dropdownOptions.pekerjaan} value={formData.waliPekerjaan} onChange={handleChange} />
                            
                            <div className="lg:col-span-3 border-t border-[#272546] pt-4 mt-2">
                                <SelectField label="Total Gabungan Penghasilan Orang Tua/Wali Rata-Rata Per Bulan" name="penghasilanOrtu" options={dropdownOptions.penghasilan} value={formData.penghasilanOrtu} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: ALAMAT */}
                    <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#272546] flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-[#272546] pb-3">
                            <span className="material-symbols-outlined text-green-400 text-[24px]">home_pin</span>
                            <h3 className="text-white text-lg font-bold">Alamat Lengkap</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="lg:col-span-4 flex flex-col gap-1.5">
                                <label className="text-xs text-[#9795c6] font-semibold">Alamat Jalan</label>
                                <textarea 
                                    name="address" 
                                    value={formData.address || ''} 
                                    onChange={handleChange} 
                                    className="w-full rounded-xl bg-[#1c1b2e] border border-[#272546] text-white focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px] p-4 transition-all outline-none resize-none text-sm" 
                                    placeholder="Nama jalan, nomor rumah, gang, dll."
                                ></textarea>
                            </div>
                            <InputField label="RT" name="rt" placeholder="001" value={formData.rt} onChange={handleChange} />
                            <InputField label="RW" name="rw" placeholder="002" value={formData.rw} onChange={handleChange} />
                            <InputField label="Desa / Kelurahan" name="village" value={formData.village} onChange={handleChange} />
                            <InputField label="Kecamatan" name="district" value={formData.district} onChange={handleChange} />
                            <InputField label="Kabupaten / Kota" name="city" value={formData.city} onChange={handleChange} />
                            <InputField label="Provinsi" name="province" value={formData.province} onChange={handleChange} />
                            <InputField label="Kode Pos" name="postalCode" value={formData.postalCode} onChange={handleChange} />
                            
                            <SelectField label="Jarak Tempat Tinggal ke Madrasah" name="jarakMadrasah" options={dropdownOptions.jarak} value={formData.jarakMadrasah} onChange={handleChange} />
                            <SelectField label="Transportasi ke Madrasah" name="transportasi" options={dropdownOptions.transportasi} value={formData.transportasi} onChange={handleChange} />
                            <SelectField label="Waktu Tempuh" name="waktuTempuh" options={dropdownOptions.waktuTempuh} value={formData.waktuTempuh} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/data-siswa')}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl text-[#9795c6] font-bold hover:bg-[#272546] hover:text-white transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl px-12 py-3 font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">save</span>
                            )}
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default StudentForm;
