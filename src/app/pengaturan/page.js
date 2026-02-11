'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Users, AlertCircle, Calendar, Clock, Check, Heart } from 'lucide-react';
import { getPengaturan, savePengaturan, getAnggota, getPemenang, savePemenang, addPemenang, getSumbangan, saveSumbangan, formatRupiah, formatDate } from '@/lib/storage';

export default function PengaturanPage() {
    const [form, setForm] = useState(getPengaturan());
    const [saved, setSaved] = useState(false);
    const [anggotaCount, setAnggotaCount] = useState(0);
    const [pemenangCount, setPemenangCount] = useState(0);

    const [anggotaList, setAnggotaList] = useState([]);
    const [pemenangList, setPemenangList] = useState([]);
    const [sumbanganList, setSumbanganList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setForm(getPengaturan());
        const allAnggota = getAnggota().filter(a => a.status === 'aktif');
        setAnggotaList(allAnggota);
        setAnggotaCount(allAnggota.length);
        
        const allPemenang = getPemenang();
        setPemenangList(allPemenang);
        setPemenangCount(allPemenang.length);

        setSumbanganList(getSumbangan());
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

    const toggleWinner = (memberId) => {
        const isWinner = pemenangList.find(p => p.anggotaId === memberId);
        let newList;
        
        if (isWinner) {
            // Remove from winners
            if (!confirm('Batalkan status pemenang untuk anggota ini?')) return;
            newList = pemenangList.filter(p => p.anggotaId !== memberId);
        } else {
            // Add to winners
            const member = anggotaList.find(a => a.id === memberId);
            const newItem = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                anggotaId: memberId,
                nama: member?.nama || 'Unknown',
                tanggal: new Date().toISOString().split('T')[0], // Default today
                jumlah: form.hadiahArisan || (form.iuranPerBulan * anggotaCount),
                keterangan: 'Manual',
            };
            newList = [...pemenangList, newItem];
        }
        
        savePemenang(newList);
        setPemenangList(newList);
        setPemenangCount(newList.length);
    };

    const toggleSumbangan = (memberId) => {
        const hasSumbangan = sumbanganList.find(s => s.anggotaId === memberId);
        let newList;

        if (hasSumbangan) {
             // Remove 
             if (!confirm('Hapus status penerima sumbangan untuk anggota ini? Data sumbangan terkait akan dihapus.')) return;
             newList = sumbanganList.filter(s => s.anggotaId !== memberId);
        } else {
            // Add default
            const member = anggotaList.find(a => a.id === memberId);
            const newItem = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                anggotaId: memberId,
                jenis: 'Lainnya',
                keterangan: 'Quick Add via Settings',
                jumlah: 0,
                tanggal: new Date().toISOString().split('T')[0],
                status: 'disalurkan'
            };
            newList = [...sumbanganList, newItem];
        }
        saveSumbangan(newList);
        setSumbanganList(newList);
    };

    const filteredAnggota = anggotaList.filter(a => 
        a.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

                {/* Manual Winner Management */}
                <div className="glass-card p-6 mb-6 border-amber-500/30">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users size={18} className="text-amber-400" /> Manajemen Pemenang Manual
                    </h2>
                    <p className="text-sm text-dark-400 mb-4">
                        Centang anggota yang <strong>sudah menang</strong> arisan di periode ini. 
                        Anggota yang dicentang tidak akan muncul saat pengocokan arisan.
                    </p>
                    
                    <div className="mb-4">
                        <input 
                            type="text" 
                            placeholder="Cari nama anggota..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="form-input w-full"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {filteredAnggota.map(member => {
                            const isWinner = pemenangList.find(p => p.anggotaId === member.id);
                            return (
                                <div 
                                    key={member.id} 
                                    onClick={() => toggleWinner(member.id)}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                        ${isWinner 
                                            ? 'bg-amber-500/10 border-amber-500/50' 
                                            : 'bg-dark-800/50 border-dark-700 hover:border-dark-500'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                                        ${isWinner ? 'border-amber-400 bg-amber-400' : 'border-dark-400'}
                                    `}>
                                        {isWinner && <Check size={12} className="text-dark-900" strokeWidth={4} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold truncate ${isWinner ? 'text-amber-400' : 'text-white'}`}>
                                            {member.nama}
                                        </p>
                                        <p className="text-xs text-dark-400 truncate">{member.kategori}</p>
                                    </div>
                                    {isWinner && (
                                        <span className="text-xs font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                            {formatDate(pemenangList.find(p => p.anggotaId === member.id)?.tanggal)}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>



                {/* Social Recipient Management */}
                <div className="glass-card p-6 mb-6 border-rose-500/30">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Heart size={18} className="text-rose-400" /> Status Penerima Sumbangan
                    </h2>
                    <p className="text-sm text-dark-400 mb-4">
                        Pantau anggota yang pernah menerima sumbangan/sosial. 
                        Centang untuk menandai penerima bantuan secara cepat.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
                        {filteredAnggota.map(member => {
                            const isRecipient = sumbanganList.find(s => s.anggotaId === member.id);
                            return (
                                <div 
                                    key={member.id} 
                                    onClick={() => toggleSumbangan(member.id)}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                        ${isRecipient 
                                            ? 'bg-rose-500/10 border-rose-500/50' 
                                            : 'bg-dark-800/50 border-dark-700 hover:border-dark-500'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                                        ${isRecipient ? 'border-rose-400 bg-rose-400' : 'border-dark-400'}
                                    `}>
                                        {isRecipient && <Check size={12} className="text-dark-900" strokeWidth={4} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold truncate ${isRecipient ? 'text-rose-400' : 'text-white'}`}>
                                            {member.nama}
                                        </p>
                                        <p className="text-xs text-dark-400 truncate">{member.jabatan}</p>
                                    </div>
                                </div>
                            );
                        })}
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
