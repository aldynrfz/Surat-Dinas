import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStudents, addStudent, updateStudent, deleteStudent, addStudentsBatch } from '../services/dataService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

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

    // --- CSV Import/Export ---

    const handleExportCSV = () => {
        const headers = Object.keys(initialFormState).join(',');
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers + "\n"
            + students.map(s => Object.keys(initialFormState).map(k => `"${s[k] || ''}"`).join(',')).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "data_siswa.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length < 2) return;

            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const data = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, '')); // Simple parser
                const obj = {};
                headers.forEach((h, i) => {
                    if (Object.keys(initialFormState).includes(h)) {
                        obj[h] = values[i] || '';
                    }
                });
                return obj;
            });

            if (confirm(`Akan mengimpor ${data.length} data siswa. Lanjutkan?`)) {
                setLoading(true);
                try {
                    await addStudentsBatch(data);
                    fetchStudents();
                    showToast(`Berhasil mengimpor ${data.length} siswa`, "success");
                } catch (error) {
                    showToast("Gagal mengimpor data: " + error.message, "error");
                } finally {
                    setLoading(false);
                }
            }
        };
        reader.readAsText(file);
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
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Student Data</h1>
                    <p className="text-[#9795c6]">Manage student records, detailed profiles, and enrollment.</p>
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
                                    placeholder="Search Name/NIS..."
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
                            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#272546] hover:bg-[#323055] text-white rounded-xl transition-colors whitespace-nowrap">
                                <span className="material-symbols-outlined text-[20px]">download</span>
                                <span className="text-sm font-semibold">Export CSV</span>
                            </button>
                            <label className="flex items-center gap-2 px-4 py-2 bg-[#272546] hover:bg-[#323055] text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                                <span className="material-symbols-outlined text-[20px]">upload</span>
                                <span className="text-sm font-semibold">Import CSV</span>
                                <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                            </label>
                            <button onClick={() => handleOpenModal('add')} className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all whitespace-nowrap">
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
                                                    <button onClick={() => handleOpenModal('edit', student)} className="p-1.5 hover:bg-amber-500/10 text-[#9795c6] hover:text-amber-400 rounded-lg transition-colors" title="Edit">
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
                                    <div>
                                        <h5 className="text-primary font-bold text-xs uppercase tracking-wider border-b border-[#272546] pb-2 mb-3">Data Pribadi</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                            {[
                                                { label: 'NIS', value: selectedStudent.nis },
                                                { label: 'NISN', value: selectedStudent.nisn },
                                                { label: 'Tempat Lahir', value: selectedStudent.placeOfBirth },
                                                { label: 'Tanggal Lahir', value: selectedStudent.dateOfBirth },
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
                                                { label: 'Nama Orang Tua', value: selectedStudent.parentName },
                                                { label: 'Pekerjaan', value: selectedStudent.parentJob },
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
                                                <input type="date" className="input-field" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} />
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
        </div>
    );
};

export default StudentData;
