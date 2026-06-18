import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllEmployees, addEmployee, updateEmployee, deleteEmployee, addEmployeesBatch } from '../services/dataService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import * as XLSX from 'xlsx';

const EmployeeData = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'detail'
    const [currentEmployeeId, setCurrentEmployeeId] = useState(null);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, employeeId: null, employeeName: '' });

    // Toast State
    const [toast, setToast] = useState(null); // { message, type }

    // Form Data State
    const initialFormState = {
        name: '',
        nip: '',
        role: '',
        rank: '',
        grade: '',
        gender: 'L',
        status: 'Active',
        address: '',
        rt: '',
        rw: '',
        village: '',
        district: '',
        city: '',
        province: '',
        postalCode: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await getAllEmployees();
            setEmployees(data);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
            showToast("Gagal memuat data pegawai", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleOpenModal = (mode, employee = null) => {
        setModalMode(mode);
        if (employee) {
            setCurrentEmployeeId(employee.id);
            setFormData({ ...initialFormState, ...employee });
        } else {
            setCurrentEmployeeId(null);
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
                await addEmployee(formData);
                showToast("Pegawai berhasil ditambahkan", "success");
            } else if (modalMode === 'edit') {
                await updateEmployee(currentEmployeeId, formData);
                showToast("Data pegawai berhasil diperbarui", "success");
            }
            closeModal();
            fetchEmployees();
        } catch (error) {
            showToast(`Gagal ${modalMode === 'add' ? 'menambahkan' : 'mengupdate'} pegawai: ` + error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (employee) => {
        setDeleteModal({
            isOpen: true,
            employeeId: employee.id,
            employeeName: employee.name
        });
    };

    const handleConfirmDelete = async () => {
        setIsSubmitting(true);
        try {
            await deleteEmployee(deleteModal.employeeId);
            showToast("Pegawai berhasil dihapus", "success");
            fetchEmployees();
        } catch (error) {
            showToast("Gagal menghapus pegawai: " + error.message, "error");
        } finally {
            setIsSubmitting(false);
            setDeleteModal({ isOpen: false, employeeId: null, employeeName: '' });
        }
    };

    // --- Upload Excel Data ---

    const handleDownloadTemplate = () => {
        // Data yang sudah ada (untuk acuan / mencegah duplikasi)
        const currentData = employees.map((e) => ({
            'Nama Lengkap': e.name || '',
            'NIP': e.nip || '',
            'Jabatan': e.role || '',
            'Pangkat': e.rank || '',
            'Golongan': e.grade || '',
            'Jenis Kelamin': e.gender || 'L',
            'Status': e.status || 'Active',
            'Jalan': e.address || '',
            'RT': e.rt || '',
            'RW': e.rw || '',
            'Desa/Kelurahan': e.village || '',
            'Kecamatan': e.district || '',
            'Kota/Kabupaten': e.city || '',
            'Provinsi': e.province || '',
            'Kode Pos': e.postalCode || ''
        }));

        // Jika kosong, sediakan 1 baris contoh
        const wsData = currentData.length > 0 ? currentData : [{
            'Nama Lengkap': 'John Doe',
            'NIP': '198001012005011001',
            'Jabatan': 'Guru Matematika',
            'Pangkat': 'Penata Muda',
            'Golongan': 'III/a',
            'Jenis Kelamin': 'L',
            'Status': 'Active',
            'Jalan': 'Jl. Pendidikan No. 1',
            'RT': '01',
            'RW': '02',
            'Desa/Kelurahan': 'Pendidikan',
            'Kecamatan': 'Pusat',
            'Kota/Kabupaten': 'Jakarta Pusat',
            'Provinsi': 'DKI Jakarta',
            'Kode Pos': '10110'
        }];

        const ws = XLSX.utils.json_to_sheet(wsData);

        // Styling dan lebar kolom
        const colWidths = [
            { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
            { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
            { wch: 5 }, { wch: 5 }, { wch: 15 }, { wch: 15 },
            { wch: 20 }, { wch: 20 }, { wch: 10 }
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data_Pegawai");

        XLSX.writeFile(wb, "Template_Data_Pegawai.xlsx");
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

    const processFile = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

                    if (jsonData.length === 0) {
                        throw new Error('File Excel kosong atau format tidak sesuai.');
                    }

                    // Pemetaan NIP untuk deduplikasi
                    const existingByNip = {};
                    employees.forEach(emp => {
                        if (emp.nip) existingByNip[emp.nip.toString()] = emp;
                    });

                    let addedCount = 0;
                    let updatedCount = 0;

                    for (const row of jsonData) {
                        const nipStr = row['NIP'] ? row['NIP'].toString() : '';
                        if (!nipStr) continue; // Skip jika tidak ada NIP

                        const employeeData = {
                            name: row['Nama Lengkap'] || '',
                            nip: nipStr,
                            role: row['Jabatan'] || '',
                            rank: row['Pangkat'] || '',
                            grade: row['Golongan'] || '',
                            gender: (row['Jenis Kelamin'] && row['Jenis Kelamin'].toUpperCase() === 'P') ? 'P' : 'L',
                            status: row['Status'] || 'Active',
                            address: row['Jalan'] || '',
                            rt: row['RT'] ? row['RT'].toString() : '',
                            rw: row['RW'] ? row['RW'].toString() : '',
                            village: row['Desa/Kelurahan'] || '',
                            district: row['Kecamatan'] || '',
                            city: row['Kota/Kabupaten'] || '',
                            province: row['Provinsi'] || '',
                            postalCode: row['Kode Pos'] ? row['Kode Pos'].toString() : ''
                        };

                        const existing = existingByNip[nipStr];

                        if (existing) {
                            await updateEmployee(existing.id, employeeData);
                            updatedCount++;
                        } else {
                            await addEmployee(employeeData);
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
            fetchEmployees();
            setIsUploadModalOpen(false);
            setSelectedFile(null);
        } catch (error) {
            showToast(`Gagal mengimpor file: ${error.message}`, "error");
        } finally {
            setIsUploading(false);
        }
    };

    // --- Filtering & Pagination ---

    const filteredData = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.nip.includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Helpers
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

    const getGradeColor = (grade) => {
        if (!grade) return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        if (grade.includes('IV')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        if (grade.includes('III/d')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (grade.includes('III/b')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    };

    const getAvatarColor = (gender) => {
        return gender === 'P'
            ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title="Hapus Pegawai"
                message={`Apakah Anda yakin ingin menghapus data pegawai "${deleteModal.employeeName}"? Tindakan ini tidak dapat dibatalkan.`}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleConfirmDelete}
                isLoading={isSubmitting}
            />

            <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 ${isModalOpen || deleteModal.isOpen ? 'blur-[2px]' : ''}`}>



                {/* Page Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Manajemen Data Pegawai</h1>
                    <p className="text-[#9795c6] text-base max-w-2xl">
                        Kelola data guru dan staf, edit profil, dan pantau detail kepegawaian dengan efisien.
                    </p>
                </div>

                {/* Toolbar */}
                <div className="glass-panel p-4 rounded-2xl border border-[#272546]">
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                        {/* Search */}
                        <div className="relative w-full md:w-96 group">
                            <span className="absolute left-3 top-2.5 text-[#9795c6] material-symbols-outlined">search</span>
                            <input
                                className="w-full pl-10 pr-3 py-2 bg-[#1c1b2e] border border-[#272546] rounded-xl text-white focus:ring-1 focus:ring-primary focus:outline-none"
                                placeholder="Cari Nama/NIP..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
                            <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#272546] hover:bg-[#323055] text-white rounded-xl transition-colors whitespace-nowrap">
                                <span className="material-symbols-outlined text-[20px]">upload</span>
                                <span className="text-sm font-semibold">Upload Data</span>
                            </button>
                            <button onClick={() => handleOpenModal('add')} className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all whitespace-nowrap">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                <span className="text-sm font-bold">Tambah Pegawai</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="glass-panel rounded-2xl border border-[#272546] overflow-hidden flex-1 flex flex-col min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-1 items-center justify-center flex-col gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <p className="text-[#9795c6]">Memuat data pegawai...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center flex-col gap-4 p-10 text-center">
                            <span className="material-symbols-outlined text-6xl text-[#272546]">person_off</span>
                            <div className="text-[#9795c6]">Tidak ada data pegawai ditemukan.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#272546]">
                                <thead className="bg-[#1c1b2e]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider w-12">No</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">Nama</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">NIP</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">Jabatan</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">Pangkat</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">Gol.</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-[#9795c6] uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#272546] bg-[#131221]/50">
                                    {paginatedData.map((employee, idx) => (
                                        <tr key={employee.id} className="hover:bg-[#1c1b2e] transition-colors group">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#9795c6]">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-9 w-9">
                                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center border ${getAvatarColor(employee.gender)}`}>
                                                            <span className="text-xs font-bold">{getInitials(employee.name)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-bold text-white max-w-[160px] truncate" title={employee.name}>{employee.name}</div>
                                                        <div className="text-xs text-[#9795c6]">
                                                            {employee.gender === 'P' ? 'Perempuan' : 'Laki-laki'} • {employee.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white/90">{employee.nip}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#9795c6]">{employee.role}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-[#9795c6]">{employee.rank}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border ${getGradeColor(employee.grade)}`}>
                                                    {employee.grade}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium transition-colors">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => handleOpenModal('detail', employee)} className="p-1.5 hover:bg-blue-500/10 text-[#9795c6] hover:text-blue-400 rounded-lg transition-colors" title="Detail">
                                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                    </button>
                                                    <button onClick={() => handleOpenModal('edit', employee)} className="p-1.5 hover:bg-amber-500/10 text-[#9795c6] hover:text-amber-400 rounded-lg transition-colors" title="Edit">
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(employee)} className="p-1.5 hover:bg-red-500/10 text-[#9795c6] hover:text-red-400 rounded-lg transition-colors" title="Hapus">
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
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
                    <div className="relative bg-[#1c1b2e] border border-[#272546] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-[#272546] flex items-center justify-between flex-shrink-0">
                            <h3 className="text-xl font-bold text-white">
                                {modalMode === 'add' ? 'Tambah Pegawai Baru' : modalMode === 'edit' ? 'Edit Data Pegawai' : 'Detail Pegawai'}
                            </h3>
                            <button onClick={closeModal} className="text-[#9795c6] hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {modalMode === 'detail' ? (
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`h-16 w-16 rounded-full flex items-center justify-center border text-2xl ${getAvatarColor(formData.gender)}`}>
                                            <span className="font-bold">{getInitials(formData.name)}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{formData.name}</h4>
                                            <p className="text-[#9795c6]">{formData.role}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                            <span className="text-[#9795c6] uppercase text-xs font-semibold">NIP</span>
                                            <span className="text-white font-medium break-words">{formData.nip || '-'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                            <span className="text-[#9795c6] uppercase text-xs font-semibold">Jenis Kelamin</span>
                                            <span className="text-white font-medium">{formData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                            <span className="text-[#9795c6] uppercase text-xs font-semibold">Pangkat</span>
                                            <span className="text-white font-medium">{formData.rank || '-'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                            <span className="text-[#9795c6] uppercase text-xs font-semibold">Golongan</span>
                                            <span className="text-white font-medium">{formData.grade || '-'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                            <span className="text-[#9795c6] uppercase text-xs font-semibold">Status</span>
                                            <span className="text-white font-medium">{formData.status}</span>
                                        </div>
                                    </div>

                                    {/* Alamat Lengkap */}
                                    <div className="mt-4 pt-4 border-t border-[#272546]">
                                        <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Alamat Lengkap</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 flex flex-col gap-1 border-b border-[#272546] pb-2">
                                                <span className="text-[#9795c6] uppercase text-xs font-semibold">Alamat</span>
                                                <span className="text-white font-medium">{formData.address || '-'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                                <span className="text-[#9795c6] uppercase text-xs font-semibold">RT</span>
                                                <span className="text-white font-medium">{formData.rt || '-'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                                <span className="text-[#9795c6] uppercase text-xs font-semibold">RW</span>
                                                <span className="text-white font-medium">{formData.rw || '-'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                                <span className="text-[#9795c6] uppercase text-xs font-semibold">Desa / Kelurahan</span>
                                                <span className="text-white font-medium">{formData.village || '-'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                                <span className="text-[#9795c6] uppercase text-xs font-semibold">Kecamatan</span>
                                                <span className="text-white font-medium">{formData.district || '-'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                                <span className="text-[#9795c6] uppercase text-xs font-semibold">Kabupaten / Kota</span>
                                                <span className="text-white font-medium">{formData.city || '-'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                                <span className="text-[#9795c6] uppercase text-xs font-semibold">Provinsi</span>
                                                <span className="text-white font-medium">{formData.province || '-'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 border-b border-[#272546] pb-2">
                                                <span className="text-[#9795c6] uppercase text-xs font-semibold">Kode Pos</span>
                                                <span className="text-white font-medium">{formData.postalCode || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form id="employeeForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">Nama Lengkap</label>
                                        <input required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Pegawai" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">NIP</label>
                                        <input required className="input-field" value={formData.nip} onChange={e => setFormData({ ...formData, nip: e.target.value })} placeholder="Nomor Induk Pegawai" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">Jenis Kelamin</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input type="radio" name="gender" value="L" checked={formData.gender === 'L'} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="accent-primary" />
                                                <span className="text-sm text-white group-hover:text-primary transition-colors">Laki-laki</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input type="radio" name="gender" value="P" checked={formData.gender === 'P'} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="accent-primary" />
                                                <span className="text-sm text-white group-hover:text-primary transition-colors">Perempuan</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">Jabatan</label>
                                        <input required className="input-field" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Contoh: Guru Matematika" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">Pangkat</label>
                                            <input className="input-field" value={formData.rank} onChange={e => setFormData({ ...formData, rank: e.target.value })} placeholder="Pangkat" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">Golongan</label>
                                            <input className="input-field" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} placeholder="Gol" />
                                        </div>
                                    </div>

                                    {/* Section: Alamat Lengkap */}
                                    <div className="pt-4 mt-2 border-t border-[#272546]">
                                        <h6 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Alamat Lengkap</h6>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#9795c6] uppercase">Alamat</label>
                                        <input className="input-field" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Jl. Contoh No. 1" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">RT</label>
                                            <input className="input-field" value={formData.rt || ''} onChange={e => setFormData({ ...formData, rt: e.target.value })} placeholder="001" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">RW</label>
                                            <input className="input-field" value={formData.rw || ''} onChange={e => setFormData({ ...formData, rw: e.target.value })} placeholder="002" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">Desa / Kelurahan</label>
                                            <input className="input-field" value={formData.village || ''} onChange={e => setFormData({ ...formData, village: e.target.value })} placeholder="Desa/Kelurahan" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">Kecamatan</label>
                                            <input className="input-field" value={formData.district || ''} onChange={e => setFormData({ ...formData, district: e.target.value })} placeholder="Kecamatan" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">Kabupaten / Kota</label>
                                            <input className="input-field" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Kab. Tasikmalaya" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">Provinsi</label>
                                            <input className="input-field" value={formData.province || ''} onChange={e => setFormData({ ...formData, province: e.target.value })} placeholder="Jawa Barat" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#9795c6] uppercase">Kode Pos</label>
                                            <input className="input-field" value={formData.postalCode || ''} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} placeholder="46155" />
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
                                <button form="employeeForm" type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all font-semibold text-sm disabled:opacity-50">
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
                            <h3 className="text-xl font-bold text-white">Upload Data Pegawai</h3>
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
                                            <p className="text-white text-sm font-semibold">Template_Data_Pegawai.xlsx</p>
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

export default EmployeeData;
