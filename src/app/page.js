'use client';
import { useState, useEffect } from 'react';
import { Users, Wallet, Shuffle, Calendar, Heart, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { getAnggota, getKeuangan, getPemenang, getJadwal, getSumbangan, getPengaturan, formatRupiah, formatDate } from '@/lib/storage';

export default function Dashboard() {
    const [stats, setStats] = useState({ anggota: 0, saldo: 0, pemenang: 0, jadwalNext: null, sumbangan: 0, totalMasuk: 0, totalKeluar: 0 });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const anggota = getAnggota();
        const keuangan = getKeuangan();
        const pemenang = getPemenang();
        const jadwal = getJadwal();
        const sumbangan = getSumbangan();

        const totalMasuk = keuangan.filter(k => k.jenis === 'masuk').reduce((s, k) => s + Number(k.jumlah), 0);
        const totalKeluar = keuangan.filter(k => k.jenis === 'keluar').reduce((s, k) => s + Number(k.jumlah), 0);

        const upcoming = jadwal
            .filter(j => new Date(j.tanggal) >= new Date())
            .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))[0];

        setStats({
            anggota: anggota.filter(a => a.status === 'aktif').length,
            saldo: totalMasuk - totalKeluar,
            pemenang: pemenang.length,
            jadwalNext: upcoming,
            sumbangan: sumbangan.length,
            totalMasuk,
            totalKeluar,
        });

        const activities = [
            ...keuangan.map(k => ({ ...k, type: 'keuangan', date: k.createdAt })),
            ...pemenang.map(p => ({ ...p, type: 'pemenang', date: p.createdAt })),
            ...sumbangan.map(s => ({ ...s, type: 'sumbangan', date: s.createdAt })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
        setRecentActivity(activities);
    }, []);

    const statCards = [
        { label: 'Anggota Aktif', value: stats.anggota, icon: Users, gradient: 'gradient-primary', shadow: 'shadow-primary-500/25' },
        { label: 'Saldo Kas', value: formatRupiah(stats.saldo), icon: Wallet, gradient: 'gradient-emerald', shadow: 'shadow-emerald-500/25' },
        { label: 'Total Pemasukan', value: formatRupiah(stats.totalMasuk), icon: TrendingUp, gradient: 'gradient-gold', shadow: 'shadow-amber-500/25' },
        { label: 'Total Pengeluaran', value: formatRupiah(stats.totalKeluar), icon: TrendingDown, gradient: 'gradient-rose', shadow: 'shadow-rose-500/25' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 pt-4 lg:pt-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-dark-400 mt-1">Selamat datang di Sistem Arisan Dharma Wanita Dinkes Asahan</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className="glass-card p-5 animate-slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-11 h-11 rounded-xl ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}>
                                <card.icon size={20} className="text-white" />
                            </div>
                        </div>
                        <p className="text-dark-400 text-xs font-medium uppercase tracking-wider">{card.label}</p>
                        <p className="text-white text-xl font-bold mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Info */}
                <div className="lg:col-span-2 glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-primary-400" /> Aktivitas Terbaru
                    </h2>
                    {recentActivity.length === 0 ? (
                        <div className="text-center py-12 text-dark-400">
                            <p className="text-sm">Belum ada aktivitas</p>
                            <p className="text-xs mt-1">Mulai tambahkan data anggota dan transaksi</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.map((act, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-900/50 hover:bg-dark-900 transition-colors">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${act.type === 'keuangan' ? 'bg-emerald-500/15 text-emerald-400' :
                                            act.type === 'pemenang' ? 'bg-amber-500/15 text-amber-400' :
                                                'bg-rose-500/15 text-rose-400'
                                        }`}>
                                        {act.type === 'keuangan' ? <Wallet size={16} /> :
                                            act.type === 'pemenang' ? <Shuffle size={16} /> :
                                                <Heart size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{act.keterangan || act.nama || 'Aktivitas'}</p>
                                        <p className="text-xs text-dark-400">{formatDate(act.date)}</p>
                                    </div>
                                    {act.jumlah && (
                                        <span className={`text-sm font-semibold ${act.jenis === 'masuk' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {act.jenis === 'masuk' ? '+' : '-'}{formatRupiah(act.jumlah)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Next Event */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Calendar size={16} className="text-primary-400" /> Kegiatan Mendatang
                        </h3>
                        {stats.jadwalNext ? (
                            <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                <p className="text-sm font-semibold text-white">{stats.jadwalNext.judul}</p>
                                <p className="text-xs text-primary-300 mt-1">{formatDate(stats.jadwalNext.tanggal)}</p>
                                {stats.jadwalNext.lokasi && (
                                    <p className="text-xs text-dark-400 mt-1">📍 {stats.jadwalNext.lokasi}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-dark-400">Tidak ada jadwal mendatang</p>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Shuffle size={16} className="text-amber-400" /> Info Arisan
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-dark-400">Sudah Dapat Arisan</span>
                                <span className="text-sm font-semibold text-amber-400">{stats.pemenang} orang</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-dark-400">Sumbangan Tercatat</span>
                                <span className="text-sm font-semibold text-rose-400">{stats.sumbangan} data</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
