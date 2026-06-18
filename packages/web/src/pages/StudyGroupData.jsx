import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllStudyGroups, addStudyGroup, getAllEmployees } from '../services/dataService'; // Real Service
import { serverTimestamp } from 'firebase/firestore';

const StudyGroupData = () => {
    const [studyGroups, setStudyGroups] = useState([]);
    const [employees, setEmployees] = useState([]); // For selecting homeroom teacher
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newGroup, setNewGroup] = useState({
        academicYear: '2023/2024',
        level: '7',
        name: '',
        homeroomTeacherId: '',
        program: 'Reguler'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [groupsData, employeesData] = await Promise.all([
                getAllStudyGroups(),
                getAllEmployees()
            ]);
            setStudyGroups(groupsData);
            setEmployees(employeesData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGroup = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Find teacher details for denormalization (optional but good for display)
            const teacher = employees.find(e => e.id === newGroup.homeroomTeacherId);

            // Check if teacher is already assigned to another group
            if (newGroup.homeroomTeacherId) {
                const teacherGroup = studyGroups.find(g =>
                    g.homeroomTeacher?.id === newGroup.homeroomTeacherId
                );

                if (teacherGroup) {
                    alert(`Wali kelas ini telah terdaftar di kelas ${teacherGroup.name}`);
                    setIsSubmitting(false);
                    return;
                }
            }

            await addStudyGroup({
                ...newGroup,
                homeroomTeacher: teacher ? {
                    name: teacher.name,
                    nip: teacher.nip,
                    id: teacher.id
                } : null,
                studentCount: 0 // Initial count
            });

            setIsModalOpen(false);
            setNewGroup({ academicYear: '2023/2024', level: '7', name: '', homeroomTeacherId: '', program: 'Reguler' });
            fetchData();
        } catch (error) {
            alert("Gagal menambahkan rombel: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Extract unique academic years from data
    const availableYears = [...new Set(studyGroups.map(group => group.academicYear))].sort().reverse();

    // Set default filter to latest year when data loads
    useEffect(() => {
        if (availableYears.length > 0 && !yearFilter) {
            setYearFilter(availableYears[0]);
        }
    }, [studyGroups, availableYears, yearFilter]);

    const filteredData = studyGroups.filter(group =>
        (group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.homeroomTeacher?.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (yearFilter === '' || group.academicYear === yearFilter)
    );

    const getTeacherInitialsColor = (name) => {
        // Simple hash for color
        return 'from-indigo-400 to-purple-500';
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 ${isModalOpen ? 'blur-[2px]' : ''}`}>



                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Rombongan Belajar</h1>
                        <p className="text-[#9795c6] text-base max-w-2xl">
                            Manage study groups (Rombel), assign homeroom teachers, and track student distribution across academic years.
                        </p>
                    </div>


                </div>

                {/* Toolbar */}
                <div className="glass-panel p-5 rounded-2xl shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-1 w-full md:w-auto gap-3 items-center flex-wrap">
                            <div className="relative w-full md:w-80 group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[#9795c6] group-focus-within:text-primary transition-colors">search</span>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-11 pr-3 py-2.5 border border-[#272546] rounded-xl leading-5 bg-[#131221] text-white placeholder-[#9795c6] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-all shadow-sm"
                                    placeholder="Search rombel name..."
                                />
                            </div>
                            <div className="relative w-full md:w-48">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[#9795c6]">calendar_month</span>
                                </div>
                                <select
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-[#272546] rounded-xl leading-5 bg-[#131221] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm appearance-none cursor-pointer shadow-sm"
                                >
                                    <option value="">Semua Tahun Ajaran</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[#9795c6] text-sm">expand_more</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/25 transition-all transform active:scale-95 group"
                            >
                                <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add</span>
                                <span className="font-bold text-sm tracking-wide">Tambah Rombel</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="glass-panel rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col border border-[#272546] min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-1 items-center justify-center flex-col gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <p className="text-[#9795c6]">Memuat data rombel...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center flex-col gap-4 p-10 text-center">
                            <span className="material-symbols-outlined text-6xl text-[#272546]">class</span>
                            <div>
                                <h3 className="text-white text-lg font-bold">Data Tidak Ditemukan</h3>
                                <p className="text-[#9795c6] text-sm mt-1">Belum ada data rombel untuk tahun ajaran ini.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-2 px-6 py-2 bg-[#272546] hover:bg-primary text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                Tambah Rombel Baru
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="min-w-full divide-y divide-[#272546]/50">
                                <thead className="bg-[#1c1b2e]/50 backdrop-blur-sm">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider w-16">No</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">Tahun Ajaran</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">Nama Rombel</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">Tingkat Kelas</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9795c6] uppercase tracking-wider">Wali Kelas</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-[#9795c6] uppercase tracking-wider">Jml Siswa</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[#9795c6] uppercase tracking-wider sticky right-0 bg-[#1c1b2e] backdrop-blur-md shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.05)]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#272546]/50 bg-[#131221]/40">
                                    {filteredData.map((group, index) => (
                                        <tr key={group.id} className="hover:bg-indigo-900/10 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#9795c6]">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-[#1e293b] text-slate-300 border border-[#272546]">
                                                    {group.academicYear}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-white">{group.name}</div>
                                                <div className="text-xs text-[#9795c6]">{group.program}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-300">{group.level}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getTeacherInitialsColor(group.homeroomTeacher?.name)} flex items-center justify-center text-white text-xs font-bold mr-3 shadow-md`}>
                                                        {getInitials(group.homeroomTeacher?.name)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white">{group.homeroomTeacher?.name || 'Belum ditentukan'}</span>
                                                        <span className="text-xs text-[#9795c6]">{group.homeroomTeacher?.nip ? `NIP. ${group.homeroomTeacher.nip}` : '-'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                                                    {group.studentCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-[#131b2c] group-hover:bg-[#172033] backdrop-blur-sm shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.05)] transition-colors">
                                                <div className="flex justify-end gap-2">
                                                    <Link to={`/rombel/${group.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary text-indigo-300 hover:text-white transition-all duration-200 group/btn" title="View Detail">
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                        <span className="text-xs font-semibold">Detail</span>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/70 backdrop-blur-sm" id="modal-add-rombel">
                    <div className="relative w-full max-w-lg overflow-hidden transition-all transform glass-panel rounded-2xl shadow-2xl bg-[#131221]/95 border border-[#272546]">
                        <div className="px-6 py-4 border-b border-[#272546] flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">add_circle</span>
                                Tambah Rombel Baru
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-[#9795c6] hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddGroup} className="px-6 py-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-[#9795c6] uppercase tracking-wide">Tahun Ajaran</label>
                                    <input
                                        className="w-full px-3 py-2.5 bg-[#1e293b]/50 border border-[#272546] rounded-xl text-sm font-medium text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder-[#9795c6]"
                                        value={newGroup.academicYear}
                                        onChange={e => setNewGroup({ ...newGroup, academicYear: e.target.value })}
                                        placeholder="Contoh: 2023/2024"
                                        type="text"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-[#9795c6] uppercase tracking-wide">Tingkat Kelas</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-3 py-2.5 bg-[#1e293b]/50 border border-[#272546] rounded-xl text-sm font-medium text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none appearance-none cursor-pointer"
                                            value={newGroup.level}
                                            onChange={e => setNewGroup({ ...newGroup, level: e.target.value })}
                                        >
                                            <option value="7">Kelas 7</option>
                                            <option value="8">Kelas 8</option>
                                            <option value="9">Kelas 9</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#9795c6] text-lg">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#9795c6] uppercase tracking-wide">Nama Rombel</label>
                                <div className="relative">
                                    <input
                                        className="w-full px-3 py-2.5 pl-10 bg-[#1e293b]/50 border border-[#272546] rounded-xl text-sm font-medium text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder-[#9795c6]"
                                        placeholder="Contoh: 7-A, 8-B"
                                        type="text"
                                        required
                                        value={newGroup.name}
                                        onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-[#9795c6] text-lg">meeting_room</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#9795c6] uppercase tracking-wide">Wali Kelas</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-3 py-2.5 pl-10 bg-[#1e293b]/50 border border-[#272546] rounded-xl text-sm font-medium text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none appearance-none cursor-pointer"
                                        value={newGroup.homeroomTeacherId}
                                        onChange={e => setNewGroup({ ...newGroup, homeroomTeacherId: e.target.value })}
                                    >
                                        <option value="">Pilih Wali Kelas</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-[#9795c6] text-lg">person_search</span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-[#1c1b2e]/50 border-t border-[#272546] flex justify-end gap-3 -mx-6 -mb-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-[#9795c6] hover:bg-[#272546] border border-transparent hover:border-[#272546] transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Rombel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyGroupData;
