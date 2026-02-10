'use client';
import { useState, useEffect } from 'react';
import { Wallet, Plus, TrendingUp, TrendingDown, Download, FileSpreadsheet, Trash2, X, Filter } from 'lucide-react';
import { getKeuangan, addKeuangan, deleteKeuangan, getAnggota, formatRupiah, formatDate } from '@/lib/storage';
import { exportKeuanganPDF } from '@/lib/exportPdf';
import { exportKeuanganExcel } from '@/lib/exportExcel';

const JENIS_MASUK = ['Iuran Arisan (Potong Gaji)', 'Iuran Arisan (Bayar Mandiri)', 'Iuran Sumbangan', 'Kas Lainnya'];
const JENIS_KELUAR = ['Pembayaran Arisan', 'Santunan Sumbangan', 'Operasional', 'Lainnya'];

const emptyForm = { tanggal: new Date().toISOString().split('T')[0], jenis: 'masuk', kategori: '', keterangan: '', jumlah: '' };

export default function KeuanganPage() {
    const [list, setList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [filterJenis, setFilterJenis] = useState('');
    const [filterBulan, setFilterBulan] = useState('');

    useEffect(() => { setList(getKeuangan()); }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        addKeuangan({ ...form, jumlah: Number(form.jumlah) });
        setList(getKeuangan());
        setShowModal(false);
        setForm(emptyForm);
    };

    const handleDelete = (id) => {
        if (confirm('Hapus transaksi ini?')) { deleteKeuangan(id); setList(getKeuangan()); }
    };

    const closeModal = () => { setShowModal(false); setForm(emptyForm); };

    const filtered = list.filter(k => {
        const matchJenis = !filterJenis || k.jenis === filterJenis;
        const matchBulan = !filterBulan || k.tanggal?.startsWith(filterBulan);
        return matchJenis && matchBulan;
    }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    const totalMasuk = filtered.filter(k => k.jenis === 'masuk').reduce((s, k) => s + Number(k.jumlah), 0);
    const totalKeluar = filtered.filter(k => k.jenis === 'keluar').reduce((s, k) => s + Number(k.jumlah), 0);
    const saldo = totalMasuk - totalKeluar;

    const handleExportPDF = () => {
        exportKeuanganPDF('LAPORAN KEUANGAN', filtered.map(k => ({ ...k, tanggal: formatDate(k.tanggal) })), filterBulan || 'Semua');
    };
    const handleExportExcel = () => {
        exportKeuanganExcel('LAPORAN KEUANGAN', filtered.map(k => ({ ...k, tanggal: formatDate(k.tanggal) })), filterBulan || 'Semua');
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pt-4 lg:pt-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                        <Wallet className="text-emerald-400" /> Manajemen Keuangan
                    </h1>
                    <p className="text-dark-400 mt-1">Kelola pemasukan dan pengeluaran</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExportPDF} className="btn btn-outline btn-sm"><Download size={14} /> PDF</button>
                    <button onClick={handleExportExcel} className="btn btn-outline btn-sm"><FileSpreadsheet size={14} /> Excel</button>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Transaksi</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <TrendingUp size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-400">Total Pemasukan</p>
                            <p className="text-xl font-bold text-emerald-400">{formatRupiah(totalMasuk)}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-rose-500/15 flex items-center justify-center">
                            <TrendingDown size={20} className="text-rose-400" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-400">Total Pengeluaran</p>
                            <p className="text-xl font-bold text-rose-400">{formatRupiah(totalKeluar)}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25">
                            <Wallet size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-400">Saldo</p>
                            <p className={`text-xl font-bold ${saldo >= 0 ? 'text-white' : 'text-rose-400'}`}>{formatRupiah(saldo)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
                <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} className="form-select sm:w-48">
                    <option value="">Semua Jenis</option>
                    <option value="masuk">Pemasukan</option>
                    <option value="keluar">Pengeluaran</option>
                </select>
                <input type="month" value={filterBulan} onChange={e => setFilterBulan(e.target.value)} className="form-input sm:w-48" />
            </div>

            {/* Table */}
            <div className="glass-card overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Tanggal</th>
                            <th>Kategori</th>
                            <th>Keterangan</th>
                            <th>Pemasukan</th>
                            <th>Pengeluaran</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-12 text-dark-400">Belum ada transaksi</td></tr>
                        ) : (
                            filtered.map((item, idx) => (
                                <tr key={item.id}>
                                    <td>{idx + 1}</td>
                                    <td className="text-sm">{formatDate(item.tanggal)}</td>
                                    <td><span className={`badge ${item.jenis === 'masuk' ? 'badge-success' : 'badge-danger'}`}>{item.kategori}</span></td>
                                    <td className="text-white">{item.keterangan || '-'}</td>
                                    <td className="text-emerald-400 font-semibold">{item.jenis === 'masuk' ? formatRupiah(item.jumlah) : ''}</td>
                                    <td className="text-rose-400 font-semibold">{item.jenis === 'keluar' ? formatRupiah(item.jumlah) : ''}</td>
                                    <td>
                                        <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Tambah Transaksi</h2>
                            <button onClick={closeModal} className="text-dark-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="form-label">Jenis Transaksi</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setForm({ ...form, jenis: 'masuk', kategori: '' })}
                                        className={`btn flex-1 ${form.jenis === 'masuk' ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : 'btn-outline'}`}>
                                        <TrendingUp size={16} /> Pemasukan
                                    </button>
                                    <button type="button" onClick={() => setForm({ ...form, jenis: 'keluar', kategori: '' })}
                                        className={`btn flex-1 ${form.jenis === 'keluar' ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30' : 'btn-outline'}`}>
                                        <TrendingDown size={16} /> Pengeluaran
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Kategori *</label>
                                <select required value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} className="form-select">
                                    <option value="">-- Pilih Kategori --</option>
                                    {(form.jenis === 'masuk' ? JENIS_MASUK : JENIS_KELUAR).map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="form-label">Tanggal *</label><input required type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="form-input" /></div>
                                <div><label className="form-label">Jumlah (Rp) *</label><input required type="number" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} className="form-input" placeholder="0" /></div>
                            </div>
                            <div><label className="form-label">Keterangan</label><textarea value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} className="form-input" rows={2} /></div>
                            <button type="submit" className="btn btn-primary w-full justify-center">Simpan Transaksi</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
