'use client';
import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, X, MapPin, Clock } from 'lucide-react';
import { getJadwal, addJadwal, updateJadwal, deleteJadwal, formatDate } from '@/lib/storage';

const KATEGORI = ['Arisan', 'Rapat', 'Sosial', 'Lainnya'];
const emptyForm = { judul: '', tanggal: '', waktu: '', lokasi: '', deskripsi: '', kategori: 'Arisan' };

export default function JadwalPage() {
    const [list, setList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [view, setView] = useState('list');

    useEffect(() => { setList(getJadwal()); }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) { updateJadwal(editId, form); }
        else { addJadwal(form); }
        setList(getJadwal());
        closeModal();
    };

    const handleEdit = (item) => {
        setForm({ judul: item.judul, tanggal: item.tanggal, waktu: item.waktu || '', lokasi: item.lokasi || '', deskripsi: item.deskripsi || '', kategori: item.kategori || 'Arisan' });
        setEditId(item.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Hapus jadwal ini?')) { deleteJadwal(id); setList(getJadwal()); }
    };

    const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

    const upcoming = list.filter(j => new Date(j.tanggal) >= new Date()).sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    const past = list.filter(j => new Date(j.tanggal) < new Date()).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    const getKategoriColor = (k) => {
        switch (k) {
            case 'Arisan': return 'badge-success';
            case 'Rapat': return 'badge-info';
            case 'Sosial': return 'badge-warning';
            default: return 'badge-danger';
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pt-4 lg:pt-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                        <Calendar className="text-primary-400" /> Jadwal Kegiatan
                    </h1>
                    <p className="text-dark-400 mt-1">Kelola jadwal kegiatan Dharma Wanita</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Tambah Jadwal</button>
            </div>

            {/* Upcoming */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">📅 Kegiatan Mendatang ({upcoming.length})</h2>
                {upcoming.length === 0 ? (
                    <div className="glass-card p-8 text-center text-dark-400 text-sm">Tidak ada kegiatan mendatang</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcoming.map((item, i) => (
                            <div key={item.id} className="glass-card p-5 animate-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`badge ${getKategoriColor(item.kategori)}`}>{item.kategori}</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(item)} className="btn btn-outline btn-sm"><Edit2 size={12} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                                <h3 className="text-white font-semibold mb-2">{item.judul}</h3>
                                <div className="space-y-1">
                                    <p className="text-xs text-dark-400 flex items-center gap-1"><Clock size={12} /> {formatDate(item.tanggal)} {item.waktu && `• ${item.waktu}`}</p>
                                    {item.lokasi && <p className="text-xs text-dark-400 flex items-center gap-1"><MapPin size={12} /> {item.lokasi}</p>}
                                </div>
                                {item.deskripsi && <p className="text-xs text-dark-500 mt-2 line-clamp-2">{item.deskripsi}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past */}
            {past.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4">📋 Kegiatan Selesai ({past.length})</h2>
                    <div className="glass-card overflow-x-auto">
                        <table className="data-table">
                            <thead><tr><th>Tanggal</th><th>Kegiatan</th><th>Kategori</th><th>Lokasi</th></tr></thead>
                            <tbody>
                                {past.map(item => (
                                    <tr key={item.id} className="opacity-60">
                                        <td className="text-sm">{formatDate(item.tanggal)}</td>
                                        <td className="font-medium text-white">{item.judul}</td>
                                        <td><span className={`badge ${getKategoriColor(item.kategori)}`}>{item.kategori}</span></td>
                                        <td className="text-sm">{item.lokasi || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">{editId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
                            <button onClick={closeModal} className="text-dark-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="form-label">Judul Kegiatan *</label>
                                <input required value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Kategori</label>
                                <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} className="form-select">
                                    {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Tanggal *</label>
                                    <input required type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Waktu</label>
                                    <input type="time" value={form.waktu} onChange={e => setForm({ ...form, waktu: e.target.value })} className="form-input" />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Lokasi</label>
                                <input value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Deskripsi</label>
                                <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} className="form-input" rows={3} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="btn btn-primary flex-1">{editId ? 'Simpan' : 'Tambah'}</button>
                                <button type="button" onClick={closeModal} className="btn btn-outline">Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
