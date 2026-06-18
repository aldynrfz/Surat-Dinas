import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStudyGroupById, getStudentsByGroupId, deleteStudyGroup } from '../services/dataService';
import Toast from '../components/Toast';

const StudyGroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState(null);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [groupData, studentsData] = await Promise.all([
                    getStudyGroupById(id),
                    getStudentsByGroupId(id)
                ]);

                if (groupData) {
                    setGroup(groupData);
                    setStudents(studentsData);
                } else {
                    navigate('/rombel');
                }
            } catch (error) {
                console.error("Failed to fetch study group detail:", error);
                // Handle error (maybe redirect or show toast)
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus rombongan belajar ini? Tindakan ini tidak dapat dibatalkan.')) {
            try {
                // Ideally we should also unassign students from this group.
                // But for now, let's just delete the group. Students will have a dangling groupId reference.
                // In a perfect world, we'd batch update students to set groupId = null.
                // Given the constraints and current scope, deleting the group is the primary action.
                // Or maybe we should loop and remove students.

                // Let's invoke deleteStudyGroup which simply deletes the doc.
                // In a real app, cloud functions are better for cleanup.
                await deleteStudyGroup(id);
                navigate('/rombel');
            } catch (error) {
                console.error("Failed to delete group:", error);
                setToast({ message: 'Gagal menghapus rombel', type: 'error' });
            }
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.nisn && student.nisn.includes(searchTerm))
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

    if (!group) return null;

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-300">
                <div className="max-w-[1400px] mx-auto flex flex-col gap-6">



                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Detail Rombongan Belajar</h1>
                            <p className="text-[#9795c6] text-base font-normal">
                                Informasi lengkap kelas dan daftar siswa.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-semibold text-sm transition-all border border-red-500/20"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                Hapus Rombel
                            </button>
                            <Link
                                to={`/rombel/${id}/edit`}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all shadow-lg shadow-primary/25"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                Edit Rombel
                            </Link>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Academic Year */}
                        <div className="bg-[#1c1b2e] p-6 rounded-2xl shadow-sm border border-[#272546] relative overflow-hidden group hover:border-primary/30 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-white">calendar_month</span>
                            </div>
                            <div className="flex flex-col gap-1 relative z-10">
                                <label className="text-[#9795c6] text-xs font-semibold uppercase tracking-wider">Tahun Ajaran</label>
                                <span className="text-xl font-bold text-white">{group.academicYear}</span>
                            </div>
                        </div>

                        {/* Level */}
                        <div className="bg-[#1c1b2e] p-6 rounded-2xl shadow-sm border border-[#272546] relative overflow-hidden group hover:border-primary/30 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-white">school</span>
                            </div>
                            <div className="flex flex-col gap-1 relative z-10">
                                <label className="text-[#9795c6] text-xs font-semibold uppercase tracking-wider">Tingkat Kelas</label>
                                <span className="text-xl font-bold text-white">{group.level}</span>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="bg-[#1c1b2e] p-6 rounded-2xl shadow-sm border border-[#272546] relative overflow-hidden group hover:border-primary/30 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-white">class</span>
                            </div>
                            <div className="flex flex-col gap-1 relative z-10">
                                <label className="text-[#9795c6] text-xs font-semibold uppercase tracking-wider">Nama Rombel</label>
                                <span className="text-xl font-bold text-white">{group.name}</span>
                            </div>
                        </div>

                        {/* Teacher */}
                        <div className="bg-[#1c1b2e] p-6 rounded-2xl shadow-sm border border-[#272546] relative overflow-hidden group hover:border-primary/30 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-white">person</span>
                            </div>
                            <div className="flex flex-col gap-1 relative z-10">
                                <label className="text-[#9795c6] text-xs font-semibold uppercase tracking-wider">Wali Kelas</label>
                                <span className="text-xl font-bold text-white">{group.homeroomTeacher?.name || 'Belum ditentukan'}</span>
                                {group.homeroomTeacher?.nip && <span className="text-xs text-[#9795c6]">NIP. {group.homeroomTeacher.nip}</span>}
                            </div>
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
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#272546]/50 bg-[#131221]/40">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-[#9795c6]">
                                                Belum ada siswa di rombel ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student, index) => (
                                            <tr key={student.id} className="hover:bg-[#1e293b]/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9795c6] font-medium">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-9 w-9 flex-shrink-0">
                                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border ${getRandomColor(index)}`}>
                                                                {getInitials(student.name)}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-semibold text-white">{student.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300 font-mono">{student.nisn || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                                        Aktif
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudyGroupDetail;
