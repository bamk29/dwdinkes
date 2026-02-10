'use client';
import { useState, useEffect } from 'react';
import { Heart, Plus, Edit2, Trash2, X, CheckCircle, Clock } from 'lucide-react';
import { getSumbangan, addSumbangan, updateSumbangan, deleteSumbangan, getAnggota, formatRupiah, formatDate } from '@/lib/storage';

const JENIS = ['Duka Cita', 'Sakit', 'Bencana', 'Lainnya'];
const emptyForm = { anggotaId: '', jenis: 'Duka Cita', keterangan: '', jumlah: '', tanggal: new Date().toISOString().split('T')[0], status: 'diproses' };

export default function SumbanganPage() {
    const [list, setList] = useState([]);
    const [anggota, setAnggota] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { setList(getSumbangan()); setAnggota(getAnggota()); }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) { updateSumbangan(editId, { ...form, jumlah: Number(form.jumlah) }); }
        else { addSumbangan({ ...form, jumlah: Number(form.jumlah) }); }
        setList(getSumbangan());
        closeModal();
    };

    const handleEdit = (item) => {
        setForm({ anggotaId: item.anggotaId, jenis: item.jenis, keterangan: item.keterangan || '', jumlah: item.jumlah, tanggal: item.tanggal, status: item.status });
        setEditId(item.id);
        setShowModal(true);
    };

    const handleDelete = (id) => { if (confirm('Hapus data sumbangan ini?')) { deleteSumbangan(id); setList(getSumbangan()); } };
    const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

    const toggleStatus = (id, currentStatus) => {
        updateSumbangan(id, { status: currentStatus === 'diproses' ? 'disalurkan' : 'diproses' });
        setList(getSumbangan());
    };

    const totalSumbangan = list.reduce((s, item) => s + Number(item.jumlah), 0);
    const disalurkan = list.filter(s => s.status === 'disalurkan').length;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pt-4 lg:pt-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                        <Heart className="text-rose-400" /> Sumbangan
                    </h1>
                    <p className="text-dark-400 mt-1">Kelola data sumbangan dan santunan</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Tambah Sumbangan</button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-5 text-center">
                    <p className="text-2xl font-bold text-white">{list.length}</p>
                    <p className="text-xs text-dark-400">Total Sumbangan</p>
                </div>
                <div className="glass-card p-5 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{disalurkan}</p>
                    <p className="text-xs text-dark-400">Sudah Disalurkan</p>
                </div>
                <div className="glass-card p-5 text-center">
                    <p className="text-2xl font-bold text-amber-400">{formatRupiah(totalSumbangan)}</p>
                    <p className="text-xs text-dark-400">Total Dana</p>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr><th>No</th><th>Tanggal</th><th>Anggota</th><th>Jenis</th><th>Keterangan</th><th>Jumlah</th><th>Status</th><th>Aksi</th></tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-12 text-dark-400">Belum ada data sumbangan</td></tr>
                        ) : (
                            list.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).map((item, idx) => {
                                const member = anggota.find(a => a.id === item.anggotaId);
                                return (
                                    <tr key={item.id}>
                                        <td>{idx + 1}</td>
                                        <td className="text-sm">{formatDate(item.tanggal)}</td>
                                        <td className="font-medium text-white">{member?.nama || '-'}</td>
                                        <td><span className={`badge ${item.jenis === 'Duka Cita' ? 'badge-danger' : item.jenis === 'Sakit' ? 'badge-warning' : 'badge-info'}`}>{item.jenis}</span></td>
                                        <td className="text-sm">{item.keterangan || '-'}</td>
                                        <td className="text-amber-400 font-semibold">{formatRupiah(item.jumlah)}</td>
                                        <td>
                                            <button onClick={() => toggleStatus(item.id, item.status)}
                                                className={`badge cursor-pointer ${item.status === 'disalurkan' ? 'badge-success' : 'badge-warning'}`}>
                                                {item.status === 'disalurkan' ? <><CheckCircle size={10} /> Disalurkan</> : <><Clock size={10} /> Diproses</>}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(item)} className="btn btn-outline btn-sm"><Edit2 size={12} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">{editId ? 'Edit Sumbangan' : 'Tambah Sumbangan'}</h2>
                            <button onClick={closeModal} className="text-dark-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="form-label">Anggota Penerima *</label>
                                <select required value={form.anggotaId} onChange={e => setForm({ ...form, anggotaId: e.target.value })} className="form-select">
                                    <option value="">-- Pilih Anggota --</option>
                                    {anggota.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Jenis *</label>
                                    <select value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })} className="form-select">
                                        {JENIS.map(j => <option key={j} value={j}>{j}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Tanggal *</label>
                                    <input required type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="form-input" />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Jumlah (Rp) *</label>
                                <input required type="number" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} className="form-input" placeholder="0" />
                            </div>
                            <div>
                                <label className="form-label">Keterangan</label>
                                <textarea value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} className="form-input" rows={2} />
                            </div>
                            <button type="submit" className="btn btn-primary w-full justify-center">{editId ? 'Simpan' : 'Tambah Sumbangan'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
