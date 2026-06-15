import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getDashboardStats, getAllLibraryBorrowings } from '../services/dataService';

// Counter-up animation hook
const useCountUp = (target, duration = 1200) => {
    const [count, setCount] = useState(0);
    const rafRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (target === 0 || target === '...') {
            setCount(target);
            return;
        }

        const numTarget = typeof target === 'number' ? target : parseInt(target, 10);
        if (isNaN(numTarget)) {
            setCount(target);
            return;
        }

        startTimeRef.current = null;

        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for a smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * numTarget));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                setCount(numTarget);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration]);

    return count;
};

// Animated stat card sub-component
const AnimatedStatValue = ({ value }) => {
    const animatedValue = useCountUp(value);
    return <>{typeof value === 'number' ? animatedValue : value}</>;
};

// ── Doughnut Chart Constants ─────────────────────────────────────────
const CHART_COLORS = [
    { stroke: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)', label: 'text-indigo-400' },   // indigo
    { stroke: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', label: 'text-sky-400' },       // sky
    { stroke: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', label: 'text-violet-400' },   // violet
    { stroke: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', label: 'text-emerald-400' },   // emerald
    { stroke: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)', label: 'text-orange-400' },    // orange
    { stroke: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)', label: 'text-pink-400' },     // pink
    { stroke: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)', label: 'text-cyan-400' },      // cyan
    { stroke: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', label: 'text-amber-400' },     // amber
    { stroke: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', label: 'text-red-400' },      // red
    { stroke: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', label: 'text-slate-400' },    // slate
];

// ── Doughnut Chart Component (pure SVG) ──────────────────────────────
const DoughnutChart = ({ data, totalBorrowed }) => {
    const [animProgress, setAnimProgress] = useState(0);
    const rafRef = useRef(null);

    const size = 220;
    const strokeWidth = 32;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    // Animate on mount
    useEffect(() => {
        let start = null;
        const duration = 1200;

        const animate = (ts) => {
            if (!start) start = ts;
            const elapsed = ts - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out quart
            const eased = 1 - Math.pow(1 - progress, 4);
            setAnimProgress(eased);
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [data]);

    // Calculate segments
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const segments = [];
    let cumulativePercent = 0;

    data.forEach((item, i) => {
        const percent = total > 0 ? item.count / total : 0;
        segments.push({
            ...item,
            percent,
            offset: cumulativePercent,
            color: CHART_COLORS[i % CHART_COLORS.length],
        });
        cumulativePercent += percent;
    });

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90">
                    {/* Background circle */}
                    <circle cx={center} cy={center} r={radius}
                        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />

                    {/* Data segments */}
                    {segments.map((seg, i) => {
                        const segmentLength = circumference * seg.percent * animProgress;
                        const gapSize = data.length > 1 ? 4 : 0;
                        const dashLength = Math.max(0, segmentLength - gapSize);
                        const segmentOffset = circumference * seg.offset * animProgress;

                        return (
                            <circle
                                key={i}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke={seg.color.stroke}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                                strokeDashoffset={-segmentOffset}
                                strokeLinecap="round"
                                style={{
                                    filter: `drop-shadow(0 0 6px ${seg.color.stroke}40)`,
                                    transition: 'stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease',
                                }}
                            />
                        );
                    })}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
                    <span className="text-3xl font-black text-white">{totalBorrowed}</span>
                    <span className="text-xs text-slate-400 font-medium mt-0.5">Total Pinjam</span>
                </div>
            </div>

            {/* Legend */}
            <div className="w-full grid grid-cols-1 gap-2 px-1">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-offset-transparent"
                            style={{
                                backgroundColor: seg.color.stroke,
                                boxShadow: `0 0 8px ${seg.color.stroke}50`,
                                ringColor: seg.color.stroke,
                            }} />
                        <span className="text-sm text-slate-300 flex-1 truncate">{seg.kategori}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{seg.count}</span>
                            <span className="text-xs text-slate-500 min-w-[36px] text-right">
                                {total > 0 ? Math.round(seg.percent * 100) : 0}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalEmployees: 0,
        totalLetters: 0,
        totalStudyGroups: 0,
        totalBMN: 0,
        lettersThisMonth: 0,
        totalLibraryBooks: 0
    });
    const [loading, setLoading] = useState(true);
    const [borrowingData, setBorrowingData] = useState([]);
    const [borrowingLoading, setBorrowingLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchBorrowings = async () => {
            try {
                const data = await getAllLibraryBorrowings();
                setBorrowingData(data);
            } catch (error) {
                console.error("Failed to fetch borrowing data:", error);
            } finally {
                setBorrowingLoading(false);
            }
        };

        fetchStats();
        fetchBorrowings();
    }, []);

    // Aggregate borrowing data by kategori
    const { chartData, totalBorrowed } = useMemo(() => {
        const categoryMap = {};
        borrowingData.forEach(item => {
            const kategori = item.bookItem?.kategori || item.bookItem?.jenis || 'Lainnya';
            categoryMap[kategori] = (categoryMap[kategori] || 0) + 1;
        });

        const sorted = Object.entries(categoryMap)
            .map(([kategori, count]) => ({ kategori, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Show top 8 categories

        // If there are more than 8, group the rest as "Lainnya"
        const allEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
        if (allEntries.length > 8) {
            const otherCount = allEntries.slice(8).reduce((sum, [, c]) => sum + c, 0);
            if (otherCount > 0) {
                sorted.push({ kategori: 'Lainnya', count: otherCount });
            }
        }

        return {
            chartData: sorted,
            totalBorrowed: borrowingData.length,
        };
    }, [borrowingData]);

    const cards = [
        { title: 'Total Siswa', value: loading ? '...' : stats.totalStudents, icon: 'school', color: 'from-blue-500 to-indigo-600', trend: '+12% from last month' },
        { title: 'Total Guru & Staf', value: loading ? '...' : stats.totalEmployees, icon: 'person', color: 'from-emerald-500 to-teal-600', trend: '+2 new this month' },
        { title: 'Total Buku Perpus', value: loading ? '...' : stats.totalLibraryBooks, icon: 'library_books', color: 'from-fuchsia-500 to-purple-600', trend: 'Mapel & Umum' },
        { title: 'Surat Keluar', value: loading ? '...' : stats.totalLetters, icon: 'description', color: 'from-orange-500 to-amber-600', trend: `${stats.lettersThisMonth} this month` },
        { title: 'Rombongan Belajar', value: loading ? '...' : stats.totalStudyGroups, icon: 'class', color: 'from-purple-500 to-pink-600', trend: 'Active classes' },
        { title: 'Total BMN', value: loading ? '...' : stats.totalBMN, icon: 'inventory_2', color: 'from-cyan-500 to-sky-600', trend: 'Barang Milik Negara' },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {cards.map((card, index) => (
                        <div key={index} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border border-[#272546]">
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                <span className="material-symbols-outlined text-6xl text-white">{card.icon}</span>
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-[#9795c6] text-sm font-medium uppercase tracking-wider">{card.title}</h3>
                                    <div className="text-3xl font-black text-white mt-2">
                                        <AnimatedStatValue value={card.value} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs">
                                    <span className="text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">{card.trend}</span>
                                </div>
                            </div>
                            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}></div>
                        </div>
                    ))}
                </div>

                {/* Doughnut Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-[#272546] lg:col-span-1 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <span className="material-symbols-outlined text-xl">pie_chart</span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-base">Kategori Buku Dipinjam</h3>
                                <p className="text-xs text-slate-400">Berdasarkan data peminjaman perpustakaan</p>
                            </div>
                        </div>

                        {borrowingLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                <span className="text-sm text-slate-400">Memuat data...</span>
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-600">library_books</span>
                                <p className="text-sm text-slate-400">Belum ada data peminjaman buku</p>
                            </div>
                        ) : (
                            <DoughnutChart data={chartData} totalBorrowed={totalBorrowed} />
                        )}
                    </div>

                    {/* Quick Info Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                        {/* Quick action: BMN */}
                        <div className="glass-panel p-6 rounded-2xl border border-[#272546] group hover:border-indigo-500/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <span className="material-symbols-outlined text-xl">trending_up</span>
                                </div>
                                <h3 className="text-white font-bold text-base">Ringkasan Peminjaman</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Sedang Dipinjam</span>
                                    <span className="text-lg font-bold text-amber-400">
                                        {borrowingLoading ? '...' : borrowingData.filter(b => b.status === 'dipinjam').length}
                                    </span>
                                </div>
                                <div className="h-px bg-white/5"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Sudah Dikembalikan</span>
                                    <span className="text-lg font-bold text-emerald-400">
                                        {borrowingLoading ? '...' : borrowingData.filter(b => b.status === 'dikembalikan').length}
                                    </span>
                                </div>
                                <div className="h-px bg-white/5"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Total Transaksi</span>
                                    <span className="text-lg font-bold text-white">
                                        {borrowingLoading ? '...' : borrowingData.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top Borrowers mini-card */}
                        <div className="glass-panel p-6 rounded-2xl border border-[#272546] group hover:border-blue-500/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.25s' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <span className="material-symbols-outlined text-xl">person</span>
                                </div>
                                <h3 className="text-white font-bold text-base">Peminjam Terbanyak</h3>
                            </div>
                            {borrowingLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                </div>
                            ) : (() => {
                                const borrowerMap = {};
                                borrowingData.forEach(item => {
                                    const name = item.nama_peminjam || 'Tidak Diketahui';
                                    borrowerMap[name] = (borrowerMap[name] || 0) + 1;
                                });
                                const topBorrowers = Object.entries(borrowerMap)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5);

                                if (topBorrowers.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                                            <span className="material-symbols-outlined text-3xl text-slate-600">group</span>
                                            <p className="text-sm text-slate-400">Belum ada peminjam</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-3">
                                        {topBorrowers.map(([name, count], i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    i === 0 ? 'bg-amber-500/20 text-amber-400' :
                                                    i === 1 ? 'bg-slate-400/20 text-slate-300' :
                                                    i === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-white/5 text-slate-500'
                                                }`}>
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm text-slate-300 flex-1 truncate">{name}</span>
                                                <span className="text-sm font-bold text-white bg-white/5 px-2 py-0.5 rounded-md">{count}x</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

