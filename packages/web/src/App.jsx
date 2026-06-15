import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import LetterHistory from './pages/LetterHistory';
import LetterService from './pages/LetterService';
import SchoolProfile from './pages/SchoolProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentData from './pages/StudentData';
import AddStudent from './pages/AddStudent';
import EmployeeData from './pages/EmployeeData';
import AddEmployee from './pages/AddEmployee';
import StudyGroupData from './pages/StudyGroupData';
import StudyGroupDetail from './pages/StudyGroupDetail';
import EditStudyGroup from './pages/EditStudyGroup';
import ActiveStudentLetter from './pages/ActiveStudentLetter';
import IncomingTransferLetter from './pages/IncomingTransferLetter';
import RecommendationLetter from './pages/RecommendationLetter';
import ParentCallLetter from './pages/ParentCallLetter';
import GoodConductLetter from './pages/GoodConductLetter';
import AchievementLetter from './pages/AchievementLetter';
import FinanceDashboard from './pages/FinanceDashboard';
import BMNData from './pages/BMNData';
import AddBMN from './pages/AddBMN';
import EditBMN from './pages/EditBMN';
import BmnBorrowingHistory from './pages/BmnBorrowingHistory';
import LibraryBookData from './pages/LibraryBookData';
import AddLibraryBook from './pages/AddLibraryBook';
import EditLibraryBook from './pages/EditLibraryBook';
import LibraryBorrowingHistory from './pages/LibraryBorrowingHistory';
import AssignmentLetter from './pages/AssignmentLetter';
import LeaveRequestLetter from './pages/LeaveRequestLetter';
import SPPDLetter from './pages/SPPDLetter';
import ResearchLetter from './pages/ResearchLetter';
import StudyPermitLetter from './pages/StudyPermitLetter';
import OutgoingTransferLetter from './pages/OutgoingTransferLetter';
import BmnBorrowLetter from './pages/BmnBorrowLetter';
import AgendaSurat from './pages/AgendaSurat';
import UserProfile from './pages/UserProfile';
import HelpCenter from './pages/HelpCenter';
import AccountSettings from './pages/AccountSettings';
import ProtectedRoute from './components/ProtectedRoute';
import { SchoolProvider } from './contexts/SchoolContext';

import { LayoutProvider, useLayout } from './contexts/LayoutContext';

// Layout component for Dashboard pages (with Sidebar and Header)
const DashboardContent = () => {
    const { isSidebarCollapsed, isMobileSidebarOpen, closeMobileSidebar } = useLayout();

    return (
        <div className="flex h-screen w-full relative">
            {/* Mobile Sidebar Backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMobileSidebar}
                />
            )}

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <main
                className={`flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-[260px]'
                    }`}
            >
                {/* Header */}
                <Header />

                {/* Content Area */}
                <Outlet />
            </main>
        </div>
    );
};

const DashboardLayout = () => {
    return (
        <LayoutProvider>
            <DashboardContent />
        </LayoutProvider>
    );
};

function App() {
    return (
        <SchoolProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes (Dashboard Layout) */}
                <Route element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/layanan-surat" element={<LetterService />} />
                    <Route path="/riwayat-surat" element={<LetterHistory />} />
                    <Route path="/agenda-surat" element={<AgendaSurat />} />
                    <Route path="/data-siswa" element={<StudentData />} />
                    <Route path="/data-siswa/tambah" element={<AddStudent />} />
                    <Route path="/pegawai" element={<EmployeeData />} />
                    <Route path="/pegawai/tambah" element={<AddEmployee />} />
                    <Route path="/rombel" element={<StudyGroupData />} />
                    <Route path="/rombel/:id" element={<StudyGroupDetail />} />
                    <Route path="/rombel/:id/edit" element={<EditStudyGroup />} />
                    <Route path="/keuangan" element={<FinanceDashboard />} />
                    <Route path="/keuangan/bmn" element={<BMNData />} />
                    <Route path="/keuangan/bmn/tambah" element={<AddBMN />} />
                    <Route path="/keuangan/bmn/edit/:id" element={<EditBMN />} />
                    <Route path="/keuangan/bmn/peminjaman" element={<BmnBorrowingHistory />} />
                    <Route path="/keuangan/perpus" element={<LibraryBookData />} />
                    <Route path="/keuangan/perpus/tambah" element={<AddLibraryBook />} />
                    <Route path="/keuangan/perpus/edit/:id" element={<EditLibraryBook />} />
                    <Route path="/keuangan/perpus/peminjaman" element={<LibraryBorrowingHistory />} />
                    <Route path="/pengaturan" element={<SchoolProfile />} />
                    <Route path="/layanan-surat/keterangan-aktif" element={<ActiveStudentLetter />} />
                    <Route path="/layanan-surat/mutasi-masuk" element={<IncomingTransferLetter />} />
                    <Route path="/layanan-surat/rekomendasi" element={<RecommendationLetter />} />
                    <Route path="/layanan-surat/panggilan-orang-tua" element={<ParentCallLetter />} />
                    <Route path="/layanan-surat/keterangan-baik" element={<GoodConductLetter />} />
                    <Route path="/layanan-surat/keterangan-berprestasi" element={<AchievementLetter />} />
                    <Route path="/layanan-surat/surat-tugas" element={<AssignmentLetter />} />
                    <Route path="/layanan-surat/pengajuan-cuti" element={<LeaveRequestLetter />} />
                    <Route path="/layanan-surat/sppd" element={<SPPDLetter />} />
                    <Route path="/layanan-surat/keterangan-penelitian" element={<ResearchLetter />} />
                    <Route path="/layanan-surat/izin-kuliah" element={<StudyPermitLetter />} />
                    <Route path="/layanan-surat/mutasi-keluar" element={<OutgoingTransferLetter />} />
                    <Route path="/layanan-surat/izin-pinjam-bmn" element={<BmnBorrowLetter />} />
                    <Route path="/profile-user" element={<UserProfile />} />
                    <Route path="/help-center" element={<HelpCenter />} />
                    <Route path="/settings-account" element={<AccountSettings />} />
                </Route>
            </Routes>
        </SchoolProvider>
    );
}

export default App;
