'use client';
import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react';
import { getAnggota, addAnggota, updateAnggota, deleteAnggota } from '@/lib/storage';

const KATEGORI_OPTIONS = [
    'Istri PNS Aktif',
    'Istri Pensiunan',
    'Partisipan Luar',
];

const emptyForm = { nama: '', jabatan: '', noHp: '', alamat: '', kategori: 'Istri PNS Aktif', status: 'aktif' };

export default function AnggotaPage() {
    const [list, setList] = useState([]);
    const [search, setSearch] = useState('');
    const [filterKategori, setFilterKategori] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { setList(getAnggota()); }, []);

    const filtered = list.filter(a => {
        const matchSearch = a.nama.toLowerCase().includes(search.toLowerCase()) || a.jabatan?.toLowerCase().includes(search.toLowerCase());
        const matchKategori = !filterKategori || a.kategori === filterKategori;
        const matchStatus = !filterStatus || a.status === filterStatus;
        return matchSearch && matchKategori && matchStatus;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) {
            updateAnggota(editId, form);
        } else {
            addAnggota(form);
        }
        setList(getAnggota());
        closeModal();
    };

    const handleEdit = (item) => {
        setForm({ nama: item.nama, jabatan: item.jabatan || '', noHp: item.noHp || '', alamat: item.alamat || '', kategori: item.kategori, status: item.status });
        setEditId(item.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Yakin hapus anggota ini?')) {
            deleteAnggota(id);
            setList(getAnggota());
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setForm(emptyForm);
    };

    const toggleStatus = (id, currentStatus) => {
        updateAnggota(id, { status: currentStatus === 'aktif' ? 'nonaktif' : 'aktif' });
        setList(getAnggota());
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pt-4 lg:pt-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="text-primary-400" /> Manajemen Anggota
                    </h1>
                    <p className="text-dark-400 mt-1">Kelola data anggota Dharma Wanita</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <Plus size={16} /> Tambah Anggota
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau jabatan..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="form-input pl-10 w-full"
                    />
                </div>
                <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className="form-select w-full md:w-48">
                    <option value="">Semua Kategori</option>
                    {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select w-full md:w-40">
                    <option value="">Semua Status</option>
                    <option value="aktif">🟢 Aktif</option>
                    <option value="nonaktif">🔴 Non-Aktif</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{list.length}</p>
                    <p className="text-xs text-dark-400">Total Anggota</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{list.filter(a => a.status === 'aktif').length}</p>
                    <p className="text-xs text-dark-400">Aktif</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{list.filter(a => a.kategori === 'Istri PNS Aktif').length}</p>
                    <p className="text-xs text-dark-400">Istri PNS Aktif</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-primary-400">{list.filter(a => a.kategori === 'Partisipan Luar').length}</p>
                    <p className="text-xs text-dark-400">Partisipan Luar</p>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="w-12 text-center">No</th>
                            <th>Nama</th>
                            <th>Kategori</th>
                            <th>Jabatan</th>
                            <th>No. HP</th>
                            <th className="text-center w-32">Status</th>
                            <th className="text-center w-24">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-12 text-dark-400">Tidak ada data anggota</td></tr>
                        ) : (
                            filtered.map((item, idx) => (
                                <tr key={item.id} className={`transition-opacity duration-200 ${item.status === 'nonaktif' ? 'bg-red-500/5 opacity-70' : ''}`}>
                                    <td className="text-center">{idx + 1}</td>
                                    <td>
                                        <p className="font-medium text-white">{item.nama}</p>
                                    </td>
                                    <td>
                                        <span className={`badge ${item.kategori === 'Istri PNS Aktif' ? 'badge-success' :
                                            item.kategori === 'Istri Pensiunan' ? 'badge-warning' : 'badge-info'
                                            }`}>{item.kategori}</span>
                                    </td>
                                    <td>{item.jabatan || '-'}</td>
                                    <td>{item.noHp || '-'}</td>
                                    <td className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <button
                                                onClick={() => toggleStatus(item.id, item.status)}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${item.status === 'aktif' ? 'bg-emerald-500' : 'bg-slate-600'
                                                    }`}
                                                title={item.status === 'aktif' ? 'Klik untuk Non-aktifkan' : 'Klik untuk Aktifkan'}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${item.status === 'aktif' ? 'translate-x-[22px]' : 'translate-x-[2px]'
                                                        }`}
                                                />
                                            </button>
                                            <span className={`text-[10px] font-bold uppercase ${item.status === 'aktif' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-2 justify-center">
                                            <button onClick={() => handleEdit(item)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all" title="Edit"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all" title="Hapus"><Trash2 size={16} /></button>
                                        </div>
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
                            <h2 className="text-lg font-bold text-white">{editId ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h2>
                            <button onClick={closeModal} className="text-dark-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="form-label">Nama Lengkap *</label>
                                <input required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="form-input" placeholder="Masukkan nama lengkap" />
                            </div>
                            <div>
                                <label className="form-label">Kategori Peserta *</label>
                                <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} className="form-select">
                                    {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Jabatan</label>
                                    <input value={form.jabatan} onChange={e => setForm({ ...form, jabatan: e.target.value })} className="form-input" placeholder="Jabatan" />
                                </div>
                                <div>
                                    <label className="form-label">No. HP</label>
                                    <input value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} className="form-input" placeholder="08xxxxxxxxxx" />
                                </div>
                            </div>

                            {/* Status Section in Modal */}
                            <div className="p-3 bg-dark-800/50 rounded-lg border border-white/5">
                                <label className="form-label mb-2">Status Keanggotaan</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-white/5 transition-all ${form.status === 'aktif' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-dark-600 text-dark-400'}`}>
                                        <input type="radio" checked={form.status === 'aktif'} onChange={() => setForm({ ...form, status: 'aktif' })} className="hidden" />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.status === 'aktif' ? 'border-emerald-500 bg-emerald-500' : 'border-dark-400'}`}>
                                            {form.status === 'aktif' && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className="font-medium">Aktif</span>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-white/5 transition-all ${form.status === 'nonaktif' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-dark-600 text-dark-400'}`}>
                                        <input type="radio" checked={form.status === 'nonaktif'} onChange={() => setForm({ ...form, status: 'nonaktif' })} className="hidden" />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.status === 'nonaktif' ? 'border-red-500 bg-red-500' : 'border-dark-400'}`}>
                                            {form.status === 'nonaktif' && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className="font-medium">Non-Aktif</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Alamat</label>
                                <textarea value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} className="form-input" rows={2} placeholder="Alamat lengkap" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="btn btn-primary flex-1">{editId ? 'Simpan Perubahan' : 'Tambah Anggota'}</button>
                                <button type="button" onClick={closeModal} className="btn btn-outline">Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
