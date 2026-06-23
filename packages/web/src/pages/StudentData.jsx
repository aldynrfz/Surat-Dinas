import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStudents, addStudent, updateStudent, deleteStudent, addStudentsBatch } from '../services/dataService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import Flatpickr from 'react-flatpickr';
import { Indonesian } from 'flatpickr/dist/l10n/id.js';
import 'flatpickr/dist/themes/dark.css';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const StudentData = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'detail'
    const [currentStudentId, setCurrentStudentId] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null); // for detail view

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, studentId: null, studentName: '' });

    // Toast State
    const [toast, setToast] = useState(null); // { message, type }

    // Form Data State
    const initialFormState = {
        name: '', nis: '', nisn: '',
        placeOfBirth: '', dateOfBirth: '', gender: 'L',
        parentName: '', parentJob: '',
        address: '', rt: '', rw: '',
        village: '', district: '', city: '', province: '', postalCode: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const data = await getAllStudents();
            setStudents(data);
        } catch (error) {
            console.error("Failed to fetch students:", error);
            showToast("Gagal memuat data siswa", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleOpenModal = (mode, student = null) => {
        setModalMode(mode);
        if (student) {
            setCurrentStudentId(student.id);
            setSelectedStudent(student); // store full student for detail view
            setFormData({ ...initialFormState, ...student });
        } else {
            setCurrentStudentId(null);
            setSelectedStudent(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (modalMode === 'add') {
                await addStudent(formData);
                showToast("Siswa berhasil ditambahkan", "success");
            } else if (modalMode === 'edit') {
                await updateStudent(currentStudentId, formData);
                showToast("Data siswa berhasil diperbarui", "success");
            }
            closeModal();
            fetchStudents();
        } catch (error) {
            showToast(`Gagal ${modalMode === 'add' ? 'menambahkan' : 'mengupdate'} siswa: ` + error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (student) => {
        setDeleteModal({
            isOpen: true,
            studentId: student.id,
            studentName: student.name
        });
    };

    const handleConfirmDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteStudent(deleteModal.studentId);
            showToast("Siswa berhasil dihapus", "success");
            fetchStudents();
        } catch (error) {
            showToast("Gagal menghapus siswa: " + error.message, "error");
        } finally {
            setIsSubmitting(false);
            setDeleteModal({ isOpen: false, studentId: null, studentName: '' });
        }
    };

    // --- Upload Excel Data ---

    const handleDownloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Data_Siswa');

        // Definisi Kolom
        sheet.columns = [
            { header: 'Nama Lengkap', key: 'name', width: 25 },
            { header: 'NIS', key: 'nis', width: 15 },
            { header: 'NISN', key: 'nisn', width: 15 },
            { header: 'NIK Siswa', key: 'nikSiswa', width: 20 },
            { header: 'No KK', key: 'noKk', width: 20 },
            { header: 'Jenis Kelamin', key: 'gender', width: 15 }, // Dropdown
            { header: 'Tempat Lahir', key: 'placeOfBirth', width: 20 },
            { header: 'Tanggal Lahir', key: 'dateOfBirth', width: 15 }, // YYYY-MM-DD
            { header: 'Agama', key: 'agama', width: 15 }, // Dropdown
            { header: 'Anak Ke', key: 'anakKe', width: 10 },
            { header: 'Jumlah Saudara', key: 'jumlahSaudara', width: 15 },
            { header: 'Cita-cita', key: 'citaCita', width: 20 }, // Dropdown
            { header: 'Hobi', key: 'hobi', width: 20 }, // Dropdown
            { header: 'No Handphone', key: 'phone', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            // Ayah
            { header: 'NIK Ayah', key: 'ayahNik', width: 20 },
            { header: 'Nama Ayah', key: 'ayahNama', width: 25 },
            { header: 'Status Ayah', key: 'ayahStatus', width: 15 }, // Dropdown
            { header: 'Tempat Lahir Ayah', key: 'ayahTempatLahir', width: 20 },
            { header: 'Tanggal Lahir Ayah', key: 'ayahTanggalLahir', width: 15 }, // YYYY-MM-DD
            { header: 'Pendidikan Ayah', key: 'ayahPendidikan', width: 20 }, // Dropdown
            { header: 'Pekerjaan Ayah', key: 'ayahPekerjaan', width: 20 }, // Dropdown
            // Ibu
            { header: 'NIK Ibu', key: 'ibuNik', width: 20 },
            { header: 'Nama Ibu', key: 'ibuNama', width: 25 },
            { header: 'Status Ibu', key: 'ibuStatus', width: 15 }, // Dropdown
            { header: 'Tempat Lahir Ibu', key: 'ibuTempatLahir', width: 20 },
            { header: 'Tanggal Lahir Ibu', key: 'ibuTanggalLahir', width: 15 },
            { header: 'Pendidikan Ibu', key: 'ibuPendidikan', width: 20 }, // Dropdown
            { header: 'Pekerjaan Ibu', key: 'ibuPekerjaan', width: 20 }, // Dropdown
            // Wali
            { header: 'NIK Wali', key: 'waliNik', width: 20 },
            { header: 'Nama Wali', key: 'waliNama', width: 25 },
            { header: 'Tempat Lahir Wali', key: 'waliTempatLahir', width: 20 },
            { header: 'Tanggal Lahir Wali', key: 'waliTanggalLahir', width: 15 },
            { header: 'Pendidikan Wali', key: 'waliPendidikan', width: 20 }, // Dropdown
            { header: 'Pekerjaan Wali', key: 'waliPekerjaan', width: 20 }, // Dropdown
            // Penghasilan & Alamat
            { header: 'Penghasilan Ortu', key: 'penghasilanOrtu', width: 25 }, // Dropdown
            { header: 'Alamat Jalan', key: 'address', width: 30 },
            { header: 'RT', key: 'rt', width: 5 },
            { header: 'RW', key: 'rw', width: 5 },
            { header: 'Desa/Kelurahan', key: 'village', width: 15 },
            { header: 'Kecamatan', key: 'district', width: 15 },
            { header: 'Kota/Kabupaten', key: 'city', width: 20 },
            { header: 'Provinsi', key: 'province', width: 20 },
            { header: 'Kode Pos', key: 'postalCode', width: 10 },
            { header: 'Jarak ke Madrasah', key: 'jarakMadrasah', width: 20 }, // Dropdown
            { header: 'Transportasi', key: 'transportasi', width: 20 }, // Dropdown
            { header: 'Waktu Tempuh', key: 'waktuTempuh', width: 20 } // Dropdown
        ];

        // Style Header
        sheet.getRow(1).font = { bold: true };

        // Tambah Data (Existing)
        if (students.length > 0) {
            students.forEach(s => {
                sheet.addRow({
                    name: s.name || '', nis: s.nis || '', nisn: s.nisn || '', nikSiswa: s.nikSiswa || '',
                    noKk: s.noKk || '', gender: s.gender || 'L', placeOfBirth: s.placeOfBirth || '',
                    dateOfBirth: s.dateOfBirth || '', agama: s.agama || '', anakKe: s.anakKe || '',
                    jumlahSaudara: s.jumlahSaudara || '', citaCita: s.citaCita || '', hobi: s.hobi || '',
                    phone: s.phone || '', email: s.email || '',
                    ayahNik: s.ayahNik || '', ayahNama: s.ayahNama || '', ayahStatus: s.ayahStatus || '',
                    ayahTempatLahir: s.ayahTempatLahir || '', ayahTanggalLahir: s.ayahTanggalLahir || '', ayahPendidikan: s.ayahPendidikan || '', ayahPekerjaan: s.ayahPekerjaan || '',
                    ibuNik: s.ibuNik || '', ibuNama: s.ibuNama || '', ibuStatus: s.ibuStatus || '',
                    ibuTempatLahir: s.ibuTempatLahir || '', ibuTanggalLahir: s.ibuTanggalLahir || '', ibuPendidikan: s.ibuPendidikan || '', ibuPekerjaan: s.ibuPekerjaan || '',
                    waliNik: s.waliNik || '', waliNama: s.waliNama || '', waliTempatLahir: s.waliTempatLahir || '', waliTanggalLahir: s.waliTanggalLahir || '',
                    waliPendidikan: s.waliPendidikan || '', waliPekerjaan: s.waliPekerjaan || '',
                    penghasilanOrtu: s.penghasilanOrtu || '', address: s.address || '', rt: s.rt || '', rw: s.rw || '',
                    village: s.village || '', district: s.district || '', city: s.city || '', province: s.province || '', postalCode: s.postalCode || '',
                    jarakMadrasah: s.jarakMadrasah || '', transportasi: s.transportasi || '', waktuTempuh: s.waktuTempuh || ''
                });
            });
        } else {
            // Contoh baris
            sheet.addRow({
                name: 'John Doe', nis: '123456', gender: 'L', dateOfBirth: '2005-01-01', ayahNama: 'Doe Senior'
            });
        }

        // Data Validation Dropdowns (Apply to rows 2 to 1000)
        const dropdowns = {
            'F': ['L', 'P'], // Gender
            'I': ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Kong Hu Cu'], // Agama
            'L': ['PNS', 'Guru/Dosen', 'Dokter', 'Politikus', 'Wiraswasta', 'Seniman/Artis', 'Ilmuwan', 'Agamawan', 'Lainnya'], // Cita-cita
            'M': ['Olahraga', 'Kesenian', 'Membaca', 'Menulis', 'Jalan-jalan', 'Lainnya'], // Hobi
            'R': ['Masih Hidup', 'Sudah Meninggal', 'Tidak Diketahui'], // Status Ayah
            'U': ['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1', 'D2', 'D3', 'D4/S1', 'S2', 'S3', 'Tidak Bersekolah', 'Lainnya'], // Pendidikan Ayah
            'V': ['Belum/tidak bekerja', 'Buruh harian lepas', 'Wiraswasta', 'Pedagang', 'PNS', 'Guru/Dosen', 'Karyawan swasta', 'Perangkat desa', 'Sopir', 'Arsitek', 'Montir', 'Petani/Peternak/Nelayan', 'Pensiunan', 'Polri', 'TNI', 'Karyawan honorer', 'Agamawan/Ustad/Guru Ngaji', 'Lainnya'], // Pekerjaan Ayah
            'Y': ['Masih Hidup', 'Sudah Meninggal', 'Tidak Diketahui'], // Status Ibu
            'AB': ['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1', 'D2', 'D3', 'D4/S1', 'S2', 'S3', 'Tidak Bersekolah', 'Lainnya'], // Pendidikan Ibu
            'AC': ['Belum/tidak bekerja', 'Buruh harian lepas', 'Wiraswasta', 'Pedagang', 'PNS', 'Guru/Dosen', 'Karyawan swasta', 'Perangkat desa', 'Sopir', 'Arsitek', 'Montir', 'Petani/Peternak/Nelayan', 'Pensiunan', 'Polri', 'TNI', 'Karyawan honorer', 'Agamawan/Ustad/Guru Ngaji', 'Lainnya'], // Pekerjaan Ibu
            'AH': ['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1', 'D2', 'D3', 'D4/S1', 'S2', 'S3', 'Tidak Bersekolah', 'Lainnya'], // Pendidikan Wali
            'AI': ['Belum/tidak bekerja', 'Buruh harian lepas', 'Wiraswasta', 'Pedagang', 'PNS', 'Guru/Dosen', 'Karyawan swasta', 'Perangkat desa', 'Sopir', 'Arsitek', 'Montir', 'Petani/Peternak/Nelayan', 'Pensiunan', 'Polri', 'TNI', 'Karyawan honorer', 'Agamawan/Ustad/Guru Ngaji', 'Lainnya'], // Pekerjaan Wali
            'AJ': ['dibawah 800.000', '800.000 - 1.200.000', '1.200.000 - 1.800.000', '1.800.000 - 2.500.000', '2.500.000 - 3.500.000', '3.500.000 - 4.800.000', '4.800.000 - 6.500.000', '6.500.000 - 10.000.000', '10.000.000 - 20.000.000', 'diatas 20.000.000'], // Penghasilan
            'AS': ['kurang dari 5 Km', 'Antara 5-10 Km', 'Antara 11-20 Km', 'Antara 21-30 Km', 'Lebih dari 30 Km'], // Jarak
            'AT': ['Jalan Kaki', 'Sepeda Motor', 'Mobil Pribadi', 'Antar Jemput Sekolah', 'Angkutan Umum', 'Perahu/Sampan', 'Kereta Api', 'Ojek', 'Andong/Bendi/Sado/Dokar/Delman/Becak'], // Transportasi
            'AU': ['1-10 menit', '10-19 menit', '20-29 menit', '30-39 menit', '1-2 jam', '> 2 jam'] // Waktu Tempuh
        };

        for (let i = 2; i <= 1000; i++) {
            for (const [col, options] of Object.entries(dropdowns)) {
                sheet.getCell(`${col}${i}`).dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: [`"${options.join(',')}"`]
                };
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, "Template_Data_Siswa.xlsx");
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const parseExcelDate = (excelDate) => {
        if (!excelDate) return '';
        if (typeof excelDate === 'string') return excelDate;
        // Konversi serial Excel ke Date JS
        const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    };

    const processFile = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(e.target.result);
                    const worksheet = workbook.worksheets[0];
                    
                    if (!worksheet) throw new Error('File Excel kosong.');

                    // Get header row mapping
                    const headers = {};
                    worksheet.getRow(1).eachCell((cell, colNumber) => {
                        headers[cell.value] = colNumber;
                    });

                    // Pemetaan NIS untuk deduplikasi
                    const existingByNis = {};
                    students.forEach(s => {
                        if (s.nis) existingByNis[s.nis.toString()] = s;
                    });

                    let addedCount = 0;
                    let updatedCount = 0;

                    for (let i = 2; i <= worksheet.rowCount; i++) {
                        const row = worksheet.getRow(i);
                        const getVal = (colName) => {
                            const val = row.getCell(headers[colName]).value;
                            if (val && typeof val === 'object' && val.text) return val.text; // formula/rich text
                            return val ? val.toString() : '';
                        };

                        const nisStr = getVal('NIS');
                        if (!nisStr) continue; // Skip jika tidak ada NIS

                        const dateOfBirthVal = row.getCell(headers['Tanggal Lahir']).value;
                        let dateOfBirth = '';
                        if (dateOfBirthVal instanceof Date) {
                            dateOfBirth = dateOfBirthVal.toISOString().split('T')[0];
                        } else {
                            dateOfBirth = parseExcelDate(dateOfBirthVal);
                        }

                        const ayahTanggalLahirVal = row.getCell(headers['Tanggal Lahir Ayah']).value;
                        const ibuTanggalLahirVal = row.getCell(headers['Tanggal Lahir Ibu']).value;
                        const waliTanggalLahirVal = row.getCell(headers['Tanggal Lahir Wali']).value;

                        const studentData = {
                            name: getVal('Nama Lengkap'),
                            nis: nisStr,
                            nisn: getVal('NISN'),
                            nikSiswa: getVal('NIK Siswa'),
                            noKk: getVal('No KK'),
                            gender: (getVal('Jenis Kelamin').toUpperCase() === 'P') ? 'P' : 'L',
                            placeOfBirth: getVal('Tempat Lahir'),
                            dateOfBirth: dateOfBirth,
                            agama: getVal('Agama'),
                            anakKe: getVal('Anak Ke'),
                            jumlahSaudara: getVal('Jumlah Saudara'),
                            citaCita: getVal('Cita-cita'),
                            hobi: getVal('Hobi'),
                            phone: getVal('No Handphone'),
                            email: getVal('Email'),
                            
                            ayahNik: getVal('NIK Ayah'),
                            ayahNama: getVal('Nama Ayah'),
                            ayahStatus: getVal('Status Ayah'),
                            ayahTempatLahir: getVal('Tempat Lahir Ayah'),
                            ayahTanggalLahir: ayahTanggalLahirVal instanceof Date ? ayahTanggalLahirVal.toISOString().split('T')[0] : parseExcelDate(ayahTanggalLahirVal),
                            ayahPendidikan: getVal('Pendidikan Ayah'),
                            ayahPekerjaan: getVal('Pekerjaan Ayah'),

                            ibuNik: getVal('NIK Ibu'),
                            ibuNama: getVal('Nama Ibu'),
                            ibuStatus: getVal('Status Ibu'),
                            ibuTempatLahir: getVal('Tempat Lahir Ibu'),
                            ibuTanggalLahir: ibuTanggalLahirVal instanceof Date ? ibuTanggalLahirVal.toISOString().split('T')[0] : parseExcelDate(ibuTanggalLahirVal),
                            ibuPendidikan: getVal('Pendidikan Ibu'),
                            ibuPekerjaan: getVal('Pekerjaan Ibu'),

                            waliNik: getVal('NIK Wali'),
                            waliNama: getVal('Nama Wali'),
                            waliTempatLahir: getVal('Tempat Lahir Wali'),
                            waliTanggalLahir: waliTanggalLahirVal instanceof Date ? waliTanggalLahirVal.toISOString().split('T')[0] : parseExcelDate(waliTanggalLahirVal),
                            waliPendidikan: getVal('Pendidikan Wali'),
                            waliPekerjaan: getVal('Pekerjaan Wali'),

                            penghasilanOrtu: getVal('Penghasilan Ortu'),

                            address: getVal('Alamat Jalan'),
                            rt: getVal('RT'),
                            rw: getVal('RW'),
                            village: getVal('Desa/Kelurahan'),
                            district: getVal('Kecamatan'),
                            city: getVal('Kota/Kabupaten'),
                            province: getVal('Provinsi'),
                            postalCode: getVal('Kode Pos'),
                            
                            jarakMadrasah: getVal('Jarak ke Madrasah'),
                            transportasi: getVal('Transportasi'),
                            waktuTempuh: getVal('Waktu Tempuh')
                        };

                        const existing = existingByNis[nisStr];

                        if (existing) {
                            await updateStudent(existing.id, studentData);
                            updatedCount++;
                        } else {
                            await addStudent(studentData);
                            addedCount++;
                        }
                    }

                    resolve({ added: addedCount, updated: updatedCount });
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const result = await processFile(selectedFile);
            showToast(`${result.added} ditambahkan, ${result.updated} diperbarui`, "success");
            fetchStudents();
            setIsUploadModalOpen(false);
            setSelectedFile(null);
        } catch (error) {
            showToast(`Gagal mengimpor file: ${error.message}`, "error");
        } finally {
            setIsUploading(false);
        }
    };

    // --- Filtering & Pagination ---

    const filteredData = students.filter(student => {
        const matchesSearch = (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.nis?.includes(searchTerm) ||
            student.nisn?.includes(searchTerm));
        const matchesClass = filterClass ? student.groupName === filterClass : true;
        return matchesSearch && matchesClass;
    }).sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Helpers
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    const uniqueClasses = [...new Set(students.map(s => s.groupName).filter(Boolean))].sort();

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Hapus Siswa"
                message={`Apakah Anda yakin ingin menghapus data siswa "${deleteModal.studentName}"? Tindakan ini tidak dapat dibatalkan.`}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleConfirmDelete}
                isLoading={isSubmitting}
            />

            <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 ${isModalOpen || deleteModal.isOpen ? 'blur-[2px]' : ''}`}>

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Data Siswa</h1>
                    <p className="text-[#9795c6]">Kelola catatan siswa, profil lengkap, dan pendaftaran.</p>
                </div>

                {/* Toolbar */}
                <div className="glass-panel p-4 rounded-2xl border border-[#272546]">
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                        {/* Search & Filter */}
                        <div className="flex flex-1 w-full gap-3 flex-wrap">
                            <div className="relative w-full md:w-64">
                                <span className="absolute left-3 top-2.5 text-[#9795c6] material-symbols-outlined">search</span>
                                <input
                                    className="w-full pl-10 pr-3 py-2 bg-[#1c1b2e] border border-[#272546] rounded-xl text-white focus:ring-1 focus:ring-primary focus:outline-none"
                                    placeholder="Cari Nama/NIS..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="w-full md:w-48 px-3 py-2 bg-[#1c1b2e] border border-[#272546] rounded-xl text-white focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                                value={filterClass}
                                onChange={e => setFilterClass(e.target.value)}
                            >
                                <option value="">Semua Kelas</option>
                                {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
                            <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#272546] hover:bg-[#323055] text-white rounded-xl transition-colors whitespace-nowrap">
                                <span className="material-symbols-outlined text-[20px]">upload</span>
                                <span className="text-sm font-semibold">Upload Data</span>
                            </button>
                            <button onClick={() => navigate('/data-siswa/tambah-siswa')} className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all whitespace-nowrap">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                <span className="text-sm font-bold">Tambah Siswa</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl border border-[#272546] overflow-hidden flex-1 min-h-[400px] flex flex-col">
                    {loading ? (
                        <div className="flex flex-1 items-center justify-center flex-col gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <p className="text-[#9795c6]">Memuat data...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center flex-col gap-4 p-10 text-center">
                            <span className="material-symbols-outlined text-6xl text-[#272546]">group_off</span>
                            <div className="text-[#9795c6]">Tidak ada data siswa ditemukan.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-[#1c1b2e] border-b border-[#272546]">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase w-12">No</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase cursor-pointer hover:text-white" onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Nama Siswa</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">NIS/NISN</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">Kelas</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase">TTL</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-[#9795c6] uppercase text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#272546]">
                                    {paginatedData.map((student, idx) => (
                                        <tr key={student.id} className="hover:bg-[#272546]/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-[#9795c6]">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                        {getInitials(student.name)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-white">{student.name}</div>
                                                        <div className="text-xs text-[#9795c6]">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-white">{student.nis}</div>
                                                <div className="text-xs text-[#9795c6]">{student.nisn || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.groupName ? (
                                                    <span className="px-2 py-0.5 rounded bg-[#272546] text-xs text-white border border-[#3b3955]">{student.groupName}</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-xs border border-amber-500/20">Aktif Tanpa Rombel</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-white">{student.placeOfBirth}</div>
                                                <div className="text-xs text-[#9795c6]">{student.dateOfBirth}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => handleOpenModal('detail', student)} className="p-1.5 hover:bg-blue-500/10 text-[#9795c6] hover:text-blue-400 rounded-lg transition-colors" title="Detail">
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    </button>
                                                    <button onClick={() => navigate('/data-siswa/edit-siswa/' + student.id)} className="p-1.5 hover:bg-amber-500/10 text-[#9795c6] hover:text-amber-400 rounded-lg transition-colors" title="Edit">
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(student)} className="p-1.5 hover:bg-red-500/10 text-[#9795c6] hover:text-red-400 rounded-lg transition-colors" title="Hapus">
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="px-6 py-4 border-t border-[#272546] flex justify-between items-center text-sm">
                            <span className="text-[#9795c6]">Halaman {currentPage} dari {totalPages}</span>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 bg-[#272546] text-white rounded hover:bg-[#323055] disabled:opacity-50">Prev</button>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 bg-[#272546] text-white rounded hover:bg-[#323055] disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto w-full h-full">
                    <div className="relative bg-[#1c1b2e] border border-[#272546] rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-[#272546] flex items-center justify-between flex-shrink-0">
                            <h3 className="text-xl font-bold text-white">
                                {modalMode === 'add' ? 'Tambah Siswa Baru' : modalMode === 'edit' ? 'Edit Data Siswa' : 'Detail Siswa'}
                            </h3>
                            <button onClick={closeModal} className="text-[#9795c6] hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {modalMode === 'detail' && selectedStudent ? (
                                <div className="flex flex-col gap-6 text-sm">
                                    {/* Identity Header */}
                                    <div className="flex items-center gap-4 p-4 bg-[#131221] rounded-xl border border-[#272546]">
                                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-black text-primary flex-shrink-0">
                                            {getInitials(selectedStudent.name)}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-base">{selectedStudent.name || '-'}</h4>
                                            <p className="text-[#9795c6] text-xs">{selectedStudent.gender === 'L' ? '👦 Laki-laki' : '👧 Perempuan'}</p>
                                            {selectedStudent.groupName ? (
                                                <span className="mt-1 inline-block px-2 py-0.5 rounded bg-[#272546] text-xs text-white border border-[#3b3955]">{selectedStudent.groupName}</span>
                                            ) : (
                                                <span className="mt-1 inline-block px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-xs border border-amber-500/20">Aktif Tanpa Rombel</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Data Pribadi */}
                                    {/* Data Pribadi */}
                                    <div>
                                        <h5 className="text-primary font-bold text-xs uppercase tracking-wider border-b border-[#272546] pb-2 mb-3">Data Pribadi</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                            {[
                                                { label: 'NIS / NISN', value: `${selectedStudent.nis || '-'} / ${selectedStudent.nisn || '-'}` },
                                                { label: 'NIK Siswa', value: selectedStudent.nikSiswa },
                                                { label: 'No KK', value: selectedStudent.noKk },
                                                { label: 'Tempat / Tgl Lahir', value: `${selectedStudent.placeOfBirth || '-'}, ${selectedStudent.dateOfBirth || '-'}` },
                                                { label: 'Agama', value: selectedStudent.agama },
                                                { label: 'Anak Ke / Jml Saudara', value: `${selectedStudent.anakKe || '-'} dari ${selectedStudent.jumlahSaudara || '-'}` },
                                                { label: 'Cita-cita', value: selectedStudent.citaCita },
                                                { label: 'Hobi', value: selectedStudent.hobi },
                                                { label: 'No Handphone', value: selectedStudent.phone },
                                                { label: 'Email', value: selectedStudent.email },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex flex-col gap-0.5">
                                                    <span className="text-[#686687] text-xs font-semibold uppercase">{label}</span>
                                                    <span className="text-white font-medium">{value || '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Data Orang Tua */}
                                    <div>
                                        <h5 className="text-primary font-bold text-xs uppercase tracking-wider border-b border-[#272546] pb-2 mb-3">Data Orang Tua / Wali</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                            {[
                                                { label: 'Nama Ayah', value: selectedStudent.ayahNama },
                                                { label: 'Tgl Lahir Ayah', value: selectedStudent.ayahTanggalLahir },
                                                { label: 'Status Ayah', value: selectedStudent.ayahStatus },
                                                { label: 'Pekerjaan Ayah', value: selectedStudent.ayahPekerjaan },
                                                { label: 'Nama Ibu', value: selectedStudent.ibuNama },
                                                { label: 'Status Ibu', value: selectedStudent.ibuStatus },
                                                { label: 'Pekerjaan Ibu', value: selectedStudent.ibuPekerjaan },
                                                { label: 'Nama Wali', value: selectedStudent.waliNama },
                                                { label: 'Penghasilan Ortu/Wali', value: selectedStudent.penghasilanOrtu },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex flex-col gap-0.5">
                                                    <span className="text-[#686687] text-xs font-semibold uppercase">{label}</span>
                                                    <span className="text-white font-medium">{value || '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Alamat */}
                                    <div>
                                        <h5 className="text-primary font-bold text-xs uppercase tracking-wider border-b border-[#272546] pb-2 mb-3">Alamat</h5>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
                                            <div className="col-span-2 md:col-span-3 flex flex-col gap-0.5">
                                                <span className="text-[#686687] text-xs font-semibold uppercase">Jalan</span>
                                                <span className="text-white font-medium">{selectedStudent.address || '-'}</span>
                                            </div>
                                            {[
                                                { label: 'RT', value: selectedStudent.rt },
                                                { label: 'RW', value: selectedStudent.rw },
                                                { label: 'Desa/Kelurahan', value: selectedStudent.village },
                                                { label: 'Kecamatan', value: selectedStudent.district },
                                                { label: 'Kota/Kab', value: selectedStudent.city },
                                                { label: 'Provinsi', value: selectedStudent.province },
                                                { label: 'Kode Pos', value: selectedStudent.postalCode },
                                                { label: 'Jarak ke Madrasah', value: selectedStudent.jarakMadrasah },
                                                { label: 'Transportasi', value: selectedStudent.transportasi },
                                                { label: 'Waktu Tempuh', value: selectedStudent.waktuTempuh },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex flex-col gap-0.5">
                                                    <span className="text-[#686687] text-xs font-semibold uppercase">{label}</span>
                                                    <span className="text-white font-medium">{value || '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form id="studentForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                                    {/* Section 1: Data Pribadi */}
                                    <div className="space-y-4">
                                        <h4 className="text-primary font-bold text-sm uppercase tracking-wider border-b border-[#272546] pb-2">Data Pribadi</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Nama Lengkap</label>
                                                <input required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Siswa" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">NIS</label>
                                                <input required className="input-field" value={formData.nis} onChange={e => setFormData({ ...formData, nis: e.target.value })} placeholder="Nomor Induk Siswa" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">NISN</label>
                                                <input className="input-field" value={formData.nisn} onChange={e => setFormData({ ...formData, nisn: e.target.value })} placeholder="NISN (Opsional)" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Jenis Kelamin</label>
                                                <select className="input-field" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                                    <option value="L">Laki-laki</option>
                                                    <option value="P">Perempuan</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Tempat Lahir</label>
                                                <input className="input-field" value={formData.placeOfBirth} onChange={e => setFormData({ ...formData, placeOfBirth: e.target.value })} placeholder="Kota Kelahiran" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Tanggal Lahir</label>
                                                <Flatpickr
                                                    className="input-field"
                                                    value={formData.dateOfBirth}
                                                    onChange={(date) => {
                                                        if (date.length > 0) {
                                                            const d = date[0];
                                                            const year = d.getFullYear();
                                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                                            const day = String(d.getDate()).padStart(2, '0');
                                                            setFormData({ ...formData, dateOfBirth: `${year}-${month}-${day}` });
                                                        }
                                                    }}
                                                    options={{
                                                        dateFormat: "Y-m-d",
                                                        locale: Indonesian,
                                                        altInput: true,
                                                        altFormat: "d F Y"
                                                    }}
                                                    placeholder="Pilih Tanggal"
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    {/* Section 2: Data Orang Tua */}
                                    <div className="space-y-4">
                                        <h4 className="text-primary font-bold text-sm uppercase tracking-wider border-b border-[#272546] pb-2">Data Orang Tua / Wali</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Nama Ayah/Ibu/Wali</label>
                                                <input className="input-field" value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} placeholder="Nama Orang Tua" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Pekerjaan</label>
                                                <input className="input-field" value={formData.parentJob} onChange={e => setFormData({ ...formData, parentJob: e.target.value })} placeholder="Pekerjaan Orang Tua" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Alamat */}
                                    <div className="space-y-4">
                                        <h4 className="text-primary font-bold text-sm uppercase tracking-wider border-b border-[#272546] pb-2">Alamat Lengkap</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Alamat Jalan</label>
                                                <textarea rows="2" className="input-field" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Nama Jalan, No. Rumah" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs text-[#9795c6] font-semibold">RT</label>
                                                    <input className="input-field" value={formData.rt} onChange={e => setFormData({ ...formData, rt: e.target.value })} placeholder="001" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs text-[#9795c6] font-semibold">RW</label>
                                                    <input className="input-field" value={formData.rw} onChange={e => setFormData({ ...formData, rw: e.target.value })} placeholder="002" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Desa/Kelurahan</label>
                                                <input className="input-field" value={formData.village} onChange={e => setFormData({ ...formData, village: e.target.value })} placeholder="Desa" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Kecamatan</label>
                                                <input className="input-field" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} placeholder="Kecamatan" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Kabupaten/Kota</label>
                                                <input className="input-field" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Kota" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Provinsi</label>
                                                <input className="input-field" value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })} placeholder="Provinsi" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs text-[#9795c6] font-semibold">Kode Pos</label>
                                                <input className="input-field" value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} placeholder="12345" />
                                            </div>
                                        </div>
                                    </div>

                                    <style>{`
                                        .input-field {
                                            width: 100%;
                                            padding: 0.5rem 1rem;
                                            background-color: #131221;
                                            border: 1px solid #272546;
                                            border-radius: 0.5rem;
                                            color: white;
                                            font-size: 0.875rem;
                                            outline: none;
                                            transition: all 0.2s;
                                        }
                                        .input-field:focus {
                                            border-color: #6366f1;
                                            ring: 1px solid #6366f1;
                                        }
                                    `}</style>
                                </form>
                            )}
                        </div>

                        <div className="p-6 border-t border-[#272546] flex justify-end gap-3 flex-shrink-0 bg-[#1c1b2e]">
                            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-[#9795c6] hover:bg-[#272546] transition-colors font-semibold text-sm">Tutup</button>
                            {modalMode !== 'detail' && (
                                <button form="studentForm" type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all font-semibold text-sm disabled:opacity-50">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1c1b2e] border border-[#272546] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col animate-in zoom-in-95 fade-in duration-200">
                        <div className="px-6 py-4 border-b border-[#272546] flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Upload Data Siswa</h3>
                            <button onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); }} className="text-[#9795c6] hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 flex flex-col gap-6">
                            {/* Download Template Section */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-sm font-semibold text-[#9795c6]">1. Unduh Template</h4>
                                <div className="bg-[#272546]/30 border border-[#272546] rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-green-500 text-3xl">description</span>
                                        <div>
                                            <p className="text-white text-sm font-semibold">Template_Data_Siswa.xlsx</p>
                                            <p className="text-[#9795c6] text-xs">Berisi struktur kolom dan data yang sudah ada.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleDownloadTemplate}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[#272546] hover:bg-[#323055] text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        Unduh
                                    </button>
                                </div>
                            </div>

                            {/* Upload Section */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-sm font-semibold text-[#9795c6]">2. Upload File Excel</h4>
                                <label 
                                    className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                        selectedFile 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-[#3b3955] bg-[#131221] hover:bg-[#272546]/50 hover:border-[#6366f1]'
                                    }`}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {selectedFile ? (
                                            <>
                                                <span className="material-symbols-outlined text-4xl text-primary mb-2">task</span>
                                                <p className="mb-1 text-sm text-white font-semibold">{selectedFile.name}</p>
                                                <p className="text-xs text-[#9795c6]">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-4xl text-[#9795c6] mb-2">upload_file</span>
                                                <p className="mb-1 text-sm text-[#9795c6]"><span className="font-semibold text-primary">Klik untuk upload</span> atau seret & lepas</p>
                                                <p className="text-xs text-[#686687]">Hanya file .xlsx</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#272546] flex justify-end gap-3 bg-[#1c1b2e] rounded-b-2xl">
                            <button 
                                type="button" 
                                onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); }} 
                                className="px-4 py-2 rounded-xl text-[#9795c6] hover:bg-[#272546] transition-colors font-semibold text-sm"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleUploadSubmit} 
                                disabled={!selectedFile || isUploading} 
                                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all font-semibold text-sm disabled:opacity-50"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Memproses...
                                    </>
                                ) : 'Simpan Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentData;
