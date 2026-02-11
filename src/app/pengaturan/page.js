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
        savePemenang(newList);
        setPemenangList(newList);
        setPemenangCount(newList.length);
    };

    const updateWinnerData = (memberId, field, value) => {
        const list = pemenangList.map(p => {
            if (p.anggotaId === memberId) {
                return { ...p, [field]: value };
            }
            return p;
        });
        savePemenang(list);
        setPemenangList(list);
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
        saveSumbangan(newList);
        setSumbanganList(newList);
    };

    const updateSumbanganData = (memberId, field, value) => {
        const list = sumbanganList.map(s => {
            if (s.anggotaId === memberId) {
                return { ...s, [field]: value };
            }
            return s;
        });
        saveSumbangan(list);
        setSumbanganList(list);
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

                    <div className="glass-card overflow-x-auto max-h-[500px]">
                        <table className="data-table">
                            <thead className="sticky top-0 bg-dark-900 z-10">
                                <tr>
                                    <th>Status</th>
                                    <th>Nama Anggota</th>
                                    <th>Tanggal Menang</th>
                                    <th>Jumlah Diterima (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAnggota.map(member => {
                                    const winner = pemenangList.find(p => p.anggotaId === member.id);
                                    const isWinner = !!winner;
                                    return (
                                        <tr key={member.id} className={isWinner ? 'bg-amber-500/5' : ''}>
                                            <td className="w-12 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isWinner} 
                                                    onChange={() => toggleWinner(member.id)}
                                                    className="checkbox checkbox-warning"
                                                />
                                            </td>
                                            <td className="font-medium text-white">
                                                {member.nama}
                                                <p className="text-[10px] text-dark-400">{member.kategori}</p>
                                            </td>
                                            <td>
                                                {isWinner && (
                                                    <input 
                                                        type="date" 
                                                        value={winner.tanggal} 
                                                        onChange={(e) => updateWinnerData(member.id, 'tanggal', e.target.value)}
                                                        className="form-input py-1 px-2 text-sm h-8"
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                {isWinner && (
                                                    <input 
                                                        type="number" 
                                                        value={winner.jumlah} 
                                                        onChange={(e) => updateWinnerData(member.id, 'jumlah', Number(e.target.value))}
                                                        className="form-input py-1 px-2 text-sm h-8 w-32"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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

                    <div className="glass-card overflow-x-auto max-h-[500px]">
                        <table className="data-table">
                            <thead className="sticky top-0 bg-dark-900 z-10">
                                <tr>
                                    <th>Status</th>
                                    <th>Nama Anggota</th>
                                    <th>Tanggal Terima</th>
                                    <th>Jenis</th>
                                    <th>Jumlah (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAnggota.map(member => {
                                    const recipient = sumbanganList.find(s => s.anggotaId === member.id);
                                    const isRecipient = !!recipient;
                                    return (
                                        <tr key={member.id} className={isRecipient ? 'bg-rose-500/5' : ''}>
                                            <td className="w-12 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isRecipient} 
                                                    onChange={() => toggleSumbangan(member.id)}
                                                    className="checkbox checkbox-error" // error = red color in daisyui/tailwind usually
                                                />
                                            </td>
                                            <td className="font-medium text-white">
                                                {member.nama}
                                                <p className="text-[10px] text-dark-400">{member.jabatan}</p>
                                            </td>
                                            <td>
                                                {isRecipient && (
                                                    <input 
                                                        type="date" 
                                                        value={recipient.tanggal} 
                                                        onChange={(e) => updateSumbanganData(member.id, 'tanggal', e.target.value)}
                                                        className="form-input py-1 px-2 text-sm h-8"
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                {isRecipient && (
                                                    <select 
                                                        value={recipient.jenis} 
                                                        onChange={(e) => updateSumbanganData(member.id, 'jenis', e.target.value)}
                                                        className="form-select py-1 px-2 text-sm h-8 w-32"
                                                    >
                                                        <option value="Sakit">Sakit</option>
                                                        <option value="Duka Cita">Duka Cita</option>
                                                        <option value="Menikah">Menikah</option>
                                                        <option value="Melahirkan">Melahirkan</option>
                                                        <option value="Lainnya">Lainnya</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td>
                                                {isRecipient && (
                                                    <input 
                                                        type="number" 
                                                        value={recipient.jumlah} 
                                                        onChange={(e) => updateSumbanganData(member.id, 'jumlah', Number(e.target.value))}
                                                        className="form-input py-1 px-2 text-sm h-8 w-32"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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
