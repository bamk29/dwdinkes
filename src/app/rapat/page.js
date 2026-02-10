'use client';
import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, X, Users, Calendar } from 'lucide-react';
import { getRapat, addRapat, updateRapat, deleteRapat, getAnggota, formatDate } from '@/lib/storage';

const emptyForm = { judul: '', tanggal: '', waktu: '', lokasi: '', agenda: '', notulensi: '', keputusan: '', pesertaIds: [] };

export default function RapatPage() {
    const [list, setList] = useState([]);
    const [anggota, setAnggota] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [viewDetail, setViewDetail] = useState(null);

    useEffect(() => { setList(getRapat()); setAnggota(getAnggota()); }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) { updateRapat(editId, form); }
        else { addRapat(form); }
        setList(getRapat());
        closeModal();
    };

    const handleEdit = (item) => {
        setForm({ judul: item.judul, tanggal: item.tanggal, waktu: item.waktu || '', lokasi: item.lokasi || '', agenda: item.agenda || '', notulensi: item.notulensi || '', keputusan: item.keputusan || '', pesertaIds: item.pesertaIds || [] });
        setEditId(item.id);
        setShowModal(true);
    };

    const handleDelete = (id) => { if (confirm('Hapus rapat ini?')) { deleteRapat(id); setList(getRapat()); } };
    const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };
    const togglePeserta = (id) => {
        setForm(prev => ({
            ...prev,
            pesertaIds: prev.pesertaIds.includes(id) ? prev.pesertaIds.filter(p => p !== id) : [...prev.pesertaIds, id]
        }));
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pt-4 lg:pt-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="text-primary-400" /> Rapat
                    </h1>
                    <p className="text-dark-400 mt-1">Kelola rapat dan notulensi</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Tambah Rapat</button>
            </div>

            {list.length === 0 ? (
                <div className="glass-card p-12 text-center text-dark-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Belum ada data rapat</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {list.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).map((item, i) => (
                        <div key={item.id} className="glass-card p-5 animate-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-white text-lg">{item.judul}</h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-dark-400 mb-3">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(item.tanggal)}</span>
                                        {item.waktu && <span>⏰ {item.waktu}</span>}
                                        {item.lokasi && <span>📍 {item.lokasi}</span>}
                                        <span className="flex items-center gap-1"><Users size={12} /> {item.pesertaIds?.length || 0} peserta</span>
                                    </div>
                                    {item.agenda && (
                                        <div className="mb-2">
                                            <p className="text-xs text-dark-500 font-semibold uppercase mb-1">Agenda:</p>
                                            <p className="text-sm text-dark-300 whitespace-pre-line">{item.agenda}</p>
                                        </div>
                                    )}
                                    {viewDetail === item.id && (
                                        <>
                                            {item.notulensi && (
                                                <div className="mt-3 p-3 rounded-lg bg-dark-900/50">
                                                    <p className="text-xs text-primary-400 font-semibold uppercase mb-1">Notulensi:</p>
                                                    <p className="text-sm text-dark-300 whitespace-pre-line">{item.notulensi}</p>
                                                </div>
                                            )}
                                            {item.keputusan && (
                                                <div className="mt-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                    <p className="text-xs text-emerald-400 font-semibold uppercase mb-1">Keputusan:</p>
                                                    <p className="text-sm text-dark-300 whitespace-pre-line">{item.keputusan}</p>
                                                </div>
                                            )}
                                            {item.pesertaIds?.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-dark-500 font-semibold uppercase mb-1">Peserta:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.pesertaIds.map(pid => {
                                                            const a = anggota.find(m => m.id === pid);
                                                            return a ? <span key={pid} className="badge badge-info">{a.nama}</span> : null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-1 ml-4">
                                    <button onClick={() => setViewDetail(viewDetail === item.id ? null : item.id)} className="btn btn-outline btn-sm">
                                        {viewDetail === item.id ? 'Tutup' : 'Detail'}
                                    </button>
                                    <button onClick={() => handleEdit(item)} className="btn btn-outline btn-sm"><Edit2 size={12} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">{editId ? 'Edit Rapat' : 'Tambah Rapat'}</h2>
                            <button onClick={closeModal} className="text-dark-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="form-label">Judul Rapat *</label>
                                <input required value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} className="form-input" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="form-label">Tanggal *</label><input required type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="form-input" /></div>
                                <div><label className="form-label">Waktu</label><input type="time" value={form.waktu} onChange={e => setForm({ ...form, waktu: e.target.value })} className="form-input" /></div>
                                <div><label className="form-label">Lokasi</label><input value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} className="form-input" /></div>
                            </div>
                            <div><label className="form-label">Agenda</label><textarea value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })} className="form-input" rows={3} /></div>
                            <div><label className="form-label">Notulensi</label><textarea value={form.notulensi} onChange={e => setForm({ ...form, notulensi: e.target.value })} className="form-input" rows={4} /></div>
                            <div><label className="form-label">Keputusan Rapat</label><textarea value={form.keputusan} onChange={e => setForm({ ...form, keputusan: e.target.value })} className="form-input" rows={2} /></div>
                            <div>
                                <label className="form-label">Peserta Rapat</label>
                                <div className="max-h-32 overflow-y-auto p-3 rounded-lg bg-dark-900/50 space-y-1">
                                    {anggota.filter(a => a.status === 'aktif').map(a => (
                                        <label key={a.id} className="flex items-center gap-2 cursor-pointer text-sm p-1 hover:bg-white/5 rounded">
                                            <input type="checkbox" checked={form.pesertaIds.includes(a.id)} onChange={() => togglePeserta(a.id)} className="accent-primary-500" />
                                            <span className="text-dark-300">{a.nama}</span>
                                        </label>
                                    ))}
                                </div>
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
