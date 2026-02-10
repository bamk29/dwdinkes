'use client';
import { useState, useEffect } from 'react';
import { BarChart3, Download, FileSpreadsheet, Users, Wallet, Shuffle, Heart, ClipboardCheck } from 'lucide-react';
import { getAnggota, getKeuangan, getPemenang, getAbsensi, getSumbangan, getPengaturan, formatRupiah, formatDate } from '@/lib/storage';
import { exportKeuanganPDF, exportAbsensiPDF, exportArisanPDF } from '@/lib/exportPdf';
import { exportKeuanganExcel, exportAbsensiExcel, exportArisanExcel } from '@/lib/exportExcel';

export default function LaporanPage() {
    const [activeTab, setActiveTab] = useState('keuangan');
    const [anggota, setAnggota] = useState([]);
    const [keuangan, setKeuangan] = useState([]);
    const [pemenang, setPemenang] = useState([]);
    const [absensi, setAbsensi] = useState([]);
    const [sumbangan, setSumbangan] = useState([]);
    const [filterBulan, setFilterBulan] = useState('');

    useEffect(() => {
        setAnggota(getAnggota());
        setKeuangan(getKeuangan());
        setPemenang(getPemenang());
        setAbsensi(getAbsensi());
        setSumbangan(getSumbangan());
    }, []);

    const tabs = [
        { id: 'keuangan', label: 'Keuangan', icon: Wallet },
        { id: 'arisan', label: 'Arisan', icon: Shuffle },
        { id: 'absensi', label: 'Absensi', icon: ClipboardCheck },
        { id: 'sumbangan', label: 'Sumbangan', icon: Heart },
    ];

    // Keuangan summary
    const filteredKeuangan = keuangan.filter(k => !filterBulan || k.tanggal?.startsWith(filterBulan));
    const totalMasuk = filteredKeuangan.filter(k => k.jenis === 'masuk').reduce((s, k) => s + Number(k.jumlah), 0);
    const totalKeluar = filteredKeuangan.filter(k => k.jenis === 'keluar').reduce((s, k) => s + Number(k.jumlah), 0);

    // Absensi dates
    const absensiDates = [...new Set(absensi.map(a => a.tanggal))].sort().reverse();

    const handleExport = (type, format) => {
        if (type === 'keuangan') {
            const data = filteredKeuangan.map(k => ({ ...k, tanggal: formatDate(k.tanggal) }));
            if (format === 'pdf') exportKeuanganPDF('LAPORAN KEUANGAN', data, filterBulan || 'Semua Periode');
            else exportKeuanganExcel('LAPORAN KEUANGAN', data, filterBulan || 'Semua Periode');
        } else if (type === 'arisan') {
            const pengaturan = getPengaturan();
            if (format === 'pdf') exportArisanPDF(pemenang, anggota, pengaturan.periodeAktif || 'Periode Aktif');
            else exportArisanExcel(pemenang, anggota, pengaturan.periodeAktif || 'Periode Aktif');
        } else if (type === 'absensi') {
            const today = absensiDates[0] || new Date().toISOString().split('T')[0];
            const data = absensi.filter(a => a.tanggal === today).map(a => ({ anggotaId: a.anggotaId, status: a.status }));
            if (format === 'pdf') exportAbsensiPDF('DAFTAR HADIR', formatDate(today), data, anggota);
            else exportAbsensiExcel('DAFTAR HADIR', formatDate(today), data, anggota);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 pt-4 lg:pt-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                    <BarChart3 className="text-primary-400" /> Laporan
                </h1>
                <p className="text-dark-400 mt-1">Laporan lengkap & export PDF/Excel</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`btn btn-sm flex items-center gap-2 ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}>
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* KEUANGAN TAB */}
            {activeTab === 'keuangan' && (
                <div>
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <input type="month" value={filterBulan} onChange={e => setFilterBulan(e.target.value)} className="form-input sm:w-48" placeholder="Filter bulan" />
                        <div className="flex gap-2 ml-auto">
                            <button onClick={() => handleExport('keuangan', 'pdf')} className="btn btn-outline btn-sm"><Download size={14} /> PDF</button>
                            <button onClick={() => handleExport('keuangan', 'excel')} className="btn btn-outline btn-sm"><FileSpreadsheet size={14} /> Excel</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="glass-card p-5 text-center">
                            <p className="text-lg font-bold text-emerald-400">{formatRupiah(totalMasuk)}</p>
                            <p className="text-xs text-dark-400">Pemasukan</p>
                        </div>
                        <div className="glass-card p-5 text-center">
                            <p className="text-lg font-bold text-rose-400">{formatRupiah(totalKeluar)}</p>
                            <p className="text-xs text-dark-400">Pengeluaran</p>
                        </div>
                        <div className="glass-card p-5 text-center">
                            <p className={`text-lg font-bold ${totalMasuk - totalKeluar >= 0 ? 'text-white' : 'text-rose-400'}`}>{formatRupiah(totalMasuk - totalKeluar)}</p>
                            <p className="text-xs text-dark-400">Saldo</p>
                        </div>
                    </div>
                    <div className="glass-card overflow-x-auto">
                        <table className="data-table">
                            <thead><tr><th>No</th><th>Tanggal</th><th>Kategori</th><th>Keterangan</th><th>Pemasukan</th><th>Pengeluaran</th></tr></thead>
                            <tbody>
                                {filteredKeuangan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{idx + 1}</td>
                                        <td className="text-sm">{formatDate(item.tanggal)}</td>
                                        <td><span className={`badge ${item.jenis === 'masuk' ? 'badge-success' : 'badge-danger'}`}>{item.kategori}</span></td>
                                        <td>{item.keterangan || '-'}</td>
                                        <td className="text-emerald-400 font-semibold">{item.jenis === 'masuk' ? formatRupiah(item.jumlah) : ''}</td>
                                        <td className="text-rose-400 font-semibold">{item.jenis === 'keluar' ? formatRupiah(item.jumlah) : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ARISAN TAB */}
            {activeTab === 'arisan' && (
                <div>
                    <div className="flex gap-2 mb-6 justify-end">
                        <button onClick={() => handleExport('arisan', 'pdf')} className="btn btn-outline btn-sm"><Download size={14} /> PDF</button>
                        <button onClick={() => handleExport('arisan', 'excel')} className="btn btn-outline btn-sm"><FileSpreadsheet size={14} /> Excel</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="glass-card p-5 text-center">
                            <p className="text-2xl font-bold text-amber-400">{pemenang.length}</p>
                            <p className="text-xs text-dark-400">Sudah Dapat Arisan</p>
                        </div>
                        <div className="glass-card p-5 text-center">
                            <p className="text-2xl font-bold text-white">{anggota.filter(a => a.status === 'aktif').length - pemenang.length}</p>
                            <p className="text-xs text-dark-400">Belum Dapat</p>
                        </div>
                    </div>

                    {/* Sudah Dapat */}
                    <h3 className="text-md font-semibold text-white mb-3">✅ Sudah Mendapat Arisan</h3>
                    <div className="glass-card overflow-x-auto mb-6">
                        <table className="data-table">
                            <thead><tr><th>No</th><th>Tanggal</th><th>Nama</th><th>Kategori</th><th>Jumlah</th></tr></thead>
                            <tbody>
                                {pemenang.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-dark-400">Belum ada pemenang</td></tr>
                                ) : (
                                    pemenang.map((p, idx) => {
                                        const a = anggota.find(m => m.id === p.anggotaId);
                                        return (
                                            <tr key={p.id}>
                                                <td>{idx + 1}</td>
                                                <td className="text-sm">{formatDate(p.tanggal)}</td>
                                                <td className="font-medium text-white">{p.nama || a?.nama || '-'}</td>
                                                <td><span className="badge badge-info">{a?.kategori || '-'}</span></td>
                                                <td className="text-amber-400 font-semibold">{formatRupiah(p.jumlah || 0)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Belum Dapat */}
                    <h3 className="text-md font-semibold text-white mb-3">⏳ Belum Mendapat Arisan</h3>
                    <div className="glass-card overflow-x-auto">
                        <table className="data-table">
                            <thead><tr><th>No</th><th>Nama</th><th>Kategori</th><th>Status</th></tr></thead>
                            <tbody>
                                {anggota.filter(a => a.status === 'aktif' && !pemenang.find(p => p.anggotaId === a.id)).map((a, idx) => (
                                    <tr key={a.id}>
                                        <td>{idx + 1}</td>
                                        <td className="font-medium text-white">{a.nama}</td>
                                        <td><span className="badge badge-info">{a.kategori}</span></td>
                                        <td><span className="badge badge-warning">Menunggu</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ABSENSI TAB */}
            {activeTab === 'absensi' && (
                <div>
                    <div className="flex gap-2 mb-6 justify-end">
                        <button onClick={() => handleExport('absensi', 'pdf')} className="btn btn-outline btn-sm"><Download size={14} /> PDF</button>
                        <button onClick={() => handleExport('absensi', 'excel')} className="btn btn-outline btn-sm"><FileSpreadsheet size={14} /> Excel</button>
                    </div>
                    <div className="glass-card overflow-x-auto">
                        <table className="data-table">
                            <thead><tr><th>No</th><th>Nama</th><th>Kategori</th><th>Total Hadir</th><th>Izin</th><th>Sakit</th><th>Alpha</th><th>Persentase</th></tr></thead>
                            <tbody>
                                {anggota.filter(a => a.status === 'aktif').map((a, idx) => {
                                    const records = absensi.filter(ab => ab.anggotaId === a.id);
                                    const h = records.filter(r => r.status === 'hadir').length;
                                    const i = records.filter(r => r.status === 'izin').length;
                                    const s = records.filter(r => r.status === 'sakit').length;
                                    const al = records.filter(r => r.status === 'alpha').length;
                                    const total = records.length;
                                    return (
                                        <tr key={a.id}>
                                            <td>{idx + 1}</td>
                                            <td className="font-medium text-white">{a.nama}</td>
                                            <td><span className="badge badge-info">{a.kategori}</span></td>
                                            <td className="text-center text-emerald-400 font-semibold">{h}</td>
                                            <td className="text-center text-amber-400">{i}</td>
                                            <td className="text-center text-blue-400">{s}</td>
                                            <td className="text-center text-rose-400">{al}</td>
                                            <td className="text-center">
                                                <span className={`font-semibold ${total > 0 ? (h / total >= 0.7 ? 'text-emerald-400' : 'text-amber-400') : 'text-dark-500'}`}>
                                                    {total > 0 ? Math.round((h / total) * 100) : 0}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SUMBANGAN TAB */}
            {activeTab === 'sumbangan' && (
                <div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="glass-card p-5 text-center">
                            <p className="text-2xl font-bold text-white">{sumbangan.length}</p>
                            <p className="text-xs text-dark-400">Total</p>
                        </div>
                        <div className="glass-card p-5 text-center">
                            <p className="text-2xl font-bold text-emerald-400">{sumbangan.filter(s => s.status === 'disalurkan').length}</p>
                            <p className="text-xs text-dark-400">Disalurkan</p>
                        </div>
                        <div className="glass-card p-5 text-center">
                            <p className="text-2xl font-bold text-amber-400">{formatRupiah(sumbangan.reduce((s, item) => s + Number(item.jumlah), 0))}</p>
                            <p className="text-xs text-dark-400">Total Dana</p>
                        </div>
                    </div>
                    <div className="glass-card overflow-x-auto">
                        <table className="data-table">
                            <thead><tr><th>No</th><th>Tanggal</th><th>Anggota</th><th>Jenis</th><th>Jumlah</th><th>Status</th></tr></thead>
                            <tbody>
                                {sumbangan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).map((item, idx) => {
                                    const a = anggota.find(m => m.id === item.anggotaId);
                                    return (
                                        <tr key={item.id}>
                                            <td>{idx + 1}</td>
                                            <td className="text-sm">{formatDate(item.tanggal)}</td>
                                            <td className="font-medium text-white">{a?.nama || '-'}</td>
                                            <td><span className={`badge ${item.jenis === 'Duka Cita' ? 'badge-danger' : 'badge-warning'}`}>{item.jenis}</span></td>
                                            <td className="text-amber-400 font-semibold">{formatRupiah(item.jumlah)}</td>
                                            <td><span className={`badge ${item.status === 'disalurkan' ? 'badge-success' : 'badge-warning'}`}>{item.status === 'disalurkan' ? 'Disalurkan' : 'Diproses'}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
