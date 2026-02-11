'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Users, AlertCircle, Calendar, Clock } from 'lucide-react';
import { getPengaturan, savePengaturan, getAnggota, getPemenang, formatRupiah } from '@/lib/storage';

export default function PengaturanPage() {
    const [form, setForm] = useState(getPengaturan());
    const [saved, setSaved] = useState(false);
    const [anggotaCount, setAnggotaCount] = useState(0);
    const [pemenangCount, setPemenangCount] = useState(0);

    useEffect(() => {
        setForm(getPengaturan());
        setAnggotaCount(getAnggota().filter(a => a.status === 'aktif').length);
        setPemenangCount(getPemenang().length);
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        savePengaturan(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        if (confirm('Reset semua pengaturan ke default?')) {
            const defaults = { periode: '12', iuranPerBulan: 100000, hadiahArisan: 0, tanggalMulai: '', tanggalBerakhir: '', periodeAktif: '' };
            setForm(defaults);
            savePengaturan(defaults);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 pt-4 lg:pt-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                    <Settings className="text-primary-400" /> Pengaturan Arisan
                </h1>
                <p className="text-dark-400 mt-1">Konfigurasi periode dan aturan main arisan</p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
                            <Users size={18} className="text-primary-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{anggotaCount}</p>
                            <p className="text-xs text-dark-400">Anggota Aktif</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                            <AlertCircle size={18} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-400">{pemenangCount}</p>
                            <p className="text-xs text-dark-400">Sudah Dapat</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <Users size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-400">{anggotaCount - pemenangCount}</p>
                            <p className="text-xs text-dark-400">Belum Dapat</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave}>
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Calendar size={18} className="text-primary-400" /> Konfigurasi Periode & Waktu
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Frekuensi Kocok (Jadwal)</label>
                            <select className="form-select bg-dark-800/50 cursor-not-allowed" disabled>
                                <option>1 Bulan Sekali</option>
                            </select>
                            <p className="text-xs text-dark-500 mt-1">Arisan dikocok setiap bulan (Fixed)</p>
                        </div>
                        <div>
                            <label className="form-label">Periode Tutup Buku (Siklus)</label>
                            <select value={form.periode} onChange={e => setForm({ ...form, periode: e.target.value })} className="form-select">
                                <option value="6">6 Bulan Sekali</option>
                                <option value="12">1 Tahun Sekali (12 Bulan)</option>
                            </select>
                            <p className="text-xs text-dark-500 mt-1">Lama satu putaran arisan sebelum reset/tutup buku</p>
                        </div>
                        <div>
                            <label className="form-label">Nama Periode Aktif</label>
                            <input value={form.periodeAktif} onChange={e => setForm({ ...form, periodeAktif: e.target.value })} className="form-input" placeholder="Contoh: Periode 2025" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Tanggal Mulai</label>
                                <input type="date" value={form.tanggalMulai} onChange={e => setForm({ ...form, tanggalMulai: e.target.value })} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Tanggal Akhir</label>
                                <input type="date" value={form.tanggalBerakhir} onChange={e => setForm({ ...form, tanggalBerakhir: e.target.value })} className="form-input" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-amber-400" /> Konfigurasi Iuran & Hadiah
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Iuran Per Bulan (Rp)</label>
                            <input type="number" value={form.iuranPerBulan} onChange={e => setForm({ ...form, iuranPerBulan: Number(e.target.value) })} className="form-input" placeholder="100000" />
                            <p className="text-xs text-dark-500 mt-1">{formatRupiah(form.iuranPerBulan)} per anggota per bulan</p>
                        </div>
                        <div>
                            <label className="form-label">Jumlah Hadiah Arisan (Rp)</label>
                            <input type="number" value={form.hadiahArisan} onChange={e => setForm({ ...form, hadiahArisan: Number(e.target.value) })} className="form-input" placeholder="0" />
                            <p className="text-xs text-dark-500 mt-1">
                                {form.hadiahArisan > 0 ? formatRupiah(form.hadiahArisan) : 'Isi 0 jika hadiah = total iuran bulan itu'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Estimasi */}
                <div className="glass-card p-6 mb-6 border-primary-500/30">
                    <h2 className="text-lg font-semibold text-white mb-4">📊 Estimasi Perputaran Uang</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between p-3 rounded-lg bg-dark-900/50">
                            <span className="text-dark-400">Total Iuran per Bulan</span>
                            <span className="text-white font-semibold">{formatRupiah(form.iuranPerBulan * anggotaCount)}</span>
                        </div>
                        <div className="flex justify-between p-3 rounded-lg bg-dark-900/50">
                            <span className="text-dark-400">Total Periode ({form.periode} Bulan)</span>
                            <span className="text-white font-semibold">{formatRupiah(form.iuranPerBulan * anggotaCount * Number(form.periode))}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button type="submit" className="btn btn-primary flex-1 justify-center">
                        <Save size={16} /> {saved ? '✓ Tersimpan!' : 'Simpan Pengaturan'}
                    </button>
                    <button type="button" onClick={handleReset} className="btn btn-outline">
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>
            </form>
        </div>
    );
}
