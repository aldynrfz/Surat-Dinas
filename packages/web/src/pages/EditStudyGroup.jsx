import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    getStudyGroupById,
    getAllStudents,
    getAllStudyGroups,
    updateStudyGroup,
    getStudentsByGroupId,
    addStudentToGroup,
    removeStudentFromGroup,
    getAllEmployees
} from '../services/dataService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

const EditStudyGroup = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Data States
    const [employees, setEmployees] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [groupStudents, setGroupStudents] = useState([]);

    const [formData, setFormData] = useState({
        academicYear: '',
        level: '',
        name: '',
        homeroomTeacherId: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSearchTerm, setModalSearchTerm] = useState('');

    // Delete Confirmation State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        studentId: null,
        studentName: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [groupData, studentsData, employeesData, groupStudentsData] = await Promise.all([
                getStudyGroupById(id),
                getAllStudents(),
                getAllEmployees(),
                getStudentsByGroupId(id)
            ]);

            if (groupData) {
                setFormData({
                    academicYear: groupData.academicYear,
                    level: groupData.level,
                    name: groupData.name,
                    homeroomTeacherId: groupData.homeroomTeacher?.id || ''
                });
                setGroupStudents(groupStudentsData);
                setEmployees(employeesData);
                setAllStudents(studentsData);
            } else {
                navigate('/rombel');
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            showToast('Gagal memuat data info rombel', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveInfo = async () => {
        setIsSubmitting(true);
        try {
            // Find teacher object
            const teacher = employees.find(e => e.id === formData.homeroomTeacherId);

            // Check if teacher is already assigned to another group
            if (formData.homeroomTeacherId) {
                const allGroups = await getAllStudyGroups();
                const teacherGroup = allGroups.find(g =>
                    g.homeroomTeacher?.id === formData.homeroomTeacherId && g.id !== id
                );

                if (teacherGroup) {
                    showToast(`Wali kelas ini telah terdaftar di kelas ${teacherGroup.name}`, 'error');
                    setIsSubmitting(false);
                    return;
                }
            }

            await updateStudyGroup(id, {
                ...formData,
                homeroomTeacher: teacher ? {
                    name: teacher.name,
                    nip: teacher.nip,
                    id: teacher.id
                } : null
            });
            showToast('Informasi rombel berhasil diperbarui', 'success');
        } catch (error) {
            console.error("Failed to update group:", error);
            showToast('Gagal memperbarui informasi rombel', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteStudent = (student) => {
        setDeleteModal({
            isOpen: true,
            studentId: student.id,
            studentName: student.name
        });
    };

    const handleDeleteStudent = async () => {
        const { studentId } = deleteModal;
        if (!studentId) return;

        try {
            await removeStudentFromGroup(studentId, id);
            // Refresh student list
            const updatedStudents = await getStudentsByGroupId(id);
            setGroupStudents(updatedStudents);
            showToast('Siswa berhasil dihapus dari rombel', 'success');
        } catch (error) {
            console.error("Failed to remove student:", error);
            showToast('Gagal menghapus siswa', 'error');
        } finally {
            setDeleteModal({ isOpen: false, studentId: null, studentName: '' });
        }
    };

    const handleAddStudent = async (student) => {
        try {
            // Check if student is already in a group
            if (student.groupId && student.groupName) {
                showToast(`Siswa ini telah terdaftar di kelas ${student.groupName}`, 'error');
                return;
            }

            const groupInfo = { id, name: formData.name };
            await addStudentToGroup(student.id, groupInfo, student);

            // Refresh logic
            const updatedStudents = await getStudentsByGroupId(id);
            setGroupStudents(updatedStudents);

            setIsModalOpen(false);
            setModalSearchTerm('');
            showToast('Siswa berhasil ditambahkan ke rombel', 'success');
        } catch (error) {
            console.error("Failed to add student:", error);
            showToast('Gagal menambahkan siswa', 'error');
        }
    };

    const filteredStudents = groupStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.nisn && student.nisn.includes(searchTerm))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Filter available students: exclude those already in THIS group
    const availableStudents = allStudents.filter(s =>
        !groupStudents.some(existing => existing.id === s.id) &&
        (s.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
            (s.nisn && s.nisn.includes(modalSearchTerm)))
    );

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    };

    const getRandomColor = (index) => {
        const colors = [
            'bg-primary/10 text-primary border-primary/20',
            'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
            'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, studentId: null, studentName: '' })}
                onConfirm={handleDeleteStudent}
                title="Hapus Siswa dari Rombel"
                message={`Apakah Anda yakin ingin menghapus siswa "${deleteModal.studentName}" dari rombel ini?`}
                type="danger"
            />

            <div className={`flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-300 ${isModalOpen ? 'blur-sm brightness-50 pointer-events-none select-none' : ''}`}>
                <div className="max-w-[1400px] mx-auto flex flex-col gap-6">



                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Edit Rombongan Belajar</h1>
                            <p className="text-[#9795c6] text-base font-normal">
                                Perbarui informasi kelas dan kelola daftar siswa.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all shadow-lg shadow-primary/25"
                            >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                Tambah Siswa
                            </button>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="bg-[#1c1b2e] p-6 rounded-2xl shadow-sm border border-[#272546]">
                        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit_note</span>
                            Informasi Kelas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[#9795c6] text-xs font-semibold uppercase tracking-wider">Tahun Ajaran</label>
                                <input
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-[#272546] bg-[#1e293b]/50 text-white text-sm font-medium focus:ring-primary focus:border-primary py-2.5 px-3 placeholder-[#9795c6]"
                                    type="text"
                                    placeholder="Contoh: 2023/2024"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[#9795c6] text-xs font-semibold uppercase tracking-wider">Tingkat Kelas</label>
                                <div className="relative">
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border-[#272546] bg-[#1e293b]/50 text-white text-sm font-medium focus:ring-primary focus:border-primary py-2.5 pl-3 pr-10 appearance-none cursor-pointer"
                                    >
                                        <option value="7">Kelas 7</option>
                                        <option value="8">Kelas 8</option>
                                        <option value="9">Kelas 9</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#9795c6]">
                                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[#9795c6] text-xs font-semibold uppercase tracking-wider">Nama Rombel</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-[#272546] bg-[#1e293b]/50 text-white text-sm font-medium focus:ring-primary focus:border-primary py-2.5 px-3"
                                    type="text"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[#9795c6] text-xs font-semibold uppercase tracking-wider">Wali Kelas</label>
                                <div className="relative">
                                    <select
                                        name="homeroomTeacherId"
                                        value={formData.homeroomTeacherId}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border-[#272546] bg-[#1e293b]/50 text-white text-sm font-medium focus:ring-primary focus:border-primary py-2.5 pl-3 pr-10 appearance-none cursor-pointer"
                                    >
                                        <option value="">Pilih Wali Kelas</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#9795c6]">
                                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 pt-4 border-t border-[#272546]/50">
                            <button
                                onClick={handleSaveInfo}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#272546] hover:bg-[#34325a] text-white font-medium text-sm transition-all disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Informasi'}
                            </button>
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="glass-panel rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col border border-[#272546]">
                        <div className="px-6 py-5 border-b border-[#272546] flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-white">Daftar Siswa</h2>
                                <span className="bg-[#1e293b] text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#272546]">{filteredStudents.length} Total</span>
                            </div>
                            <div className="relative w-full max-w-xs hidden md:block">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[#9795c6] text-[18px]">search</span>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-1.5 border border-[#272546] rounded-lg leading-5 bg-[#131221]/50 text-white placeholder-[#9795c6] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-shadow"
                                    placeholder="Cari siswa..."
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="min-w-full divide-y divide-[#272546]/50">
                                <thead className="bg-[#1e293b]/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider w-16">No</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">Nama Siswa</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">NISN</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[#9795c6] uppercase tracking-wider w-24">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#272546]/50 bg-[#131221]/40">
                                    {currentStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-[#9795c6]">
                                                Belum ada siswa di rombel ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentStudents.map((student, index) => (
                                            <tr key={student.id} className="hover:bg-[#1e293b]/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9795c6] font-medium">{indexOfFirstItem + index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-9 w-9 flex-shrink-0">
                                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border ${getRandomColor(index)}`}>
                                                                {getInitials(student.name)}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-semibold text-white">{student.name}</div>
                                                            <div className="text-xs text-[#9795c6] md:hidden">{student.nisn}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300 font-mono hidden md:table-cell">{student.nisn}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => confirmDeleteStudent(student)}
                                                        className="text-[#9795c6] hover:text-red-400 p-2 hover:bg-red-900/20 rounded-full transition-all"
                                                        title="Hapus Siswa"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredStudents.length > itemsPerPage && (
                            <div className="px-6 py-4 border-t border-[#272546] flex items-center justify-between">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-[#272546] disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-[#9795c6]"
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <div className="text-sm text-[#9795c6]">
                                    Page <span className="font-semibold text-white">{currentPage}</span> of <span className="font-semibold text-white">{totalPages}</span>
                                </div>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-[#272546] disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-[#9795c6]"
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Student Modal */}
            {isModalOpen && (
                <div aria-labelledby="modal-title" aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto" role="dialog">
                    <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                        <div
                            aria-hidden="true"
                            className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsModalOpen(false)}
                        ></div>
                        <div className="relative transform overflow-hidden rounded-2xl bg-[#1e1c30] text-left shadow-2xl transition-all sm:w-full sm:max-w-xl border border-white/10 ring-1 ring-white/5">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white leading-6" id="modal-title">Tambah Siswa</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>
                            <div className="px-6 py-5">
                                <div className="relative mb-6">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={modalSearchTerm}
                                        onChange={(e) => setModalSearchTerm(e.target.value)}
                                        className="block w-full rounded-xl border-0 bg-[#0f172a]/50 py-3.5 pl-11 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 shadow-inner ring-1 ring-white/5"
                                        placeholder="Cari Nama atau NISN..."
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hasil Pencarian</p>

                                    {availableStudents.length === 0 ? (
                                        <div className="text-slate-500 text-center py-4 text-sm">
                                            {modalSearchTerm ? 'Tidak ada siswa ditemukan' : 'Ketik nama atau NISN untuk mencari'}
                                        </div>
                                    ) : (
                                        availableStudents.map((student, index) => (
                                            <div key={student.id} className="group flex items-center justify-between gap-x-4 rounded-xl p-3 hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                                                <div className="flex min-w-0 gap-x-4 items-center">
                                                    <div className="h-10 w-10 flex-none">
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border ${getRandomColor(index)}`}>
                                                            {getInitials(student.name)}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-auto">
                                                        <p className="text-sm font-semibold leading-6 text-white group-hover:text-primary transition-colors">{student.name}</p>
                                                        <p className="truncate text-xs leading-5 text-slate-400 font-mono">{student.nisn}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddStudent(student)}
                                                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all transform active:scale-95"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                                    Add
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="bg-black/20 px-6 py-4 flex items-center justify-between border-t border-white/5">
                                <span className="text-xs text-slate-500">{availableStudents.length} siswa ditemukan</span>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                    type="button"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditStudyGroup;
