'use client';
import { useState, useEffect } from 'react';
import { ClipboardList, FileText, Download, Filter, CheckCircle, XCircle, Clock, AlertTriangle, Printer, Trophy } from 'lucide-react';
import { getAnggota, getAbsensi, saveAbsensi, getJadwal, getPemenang, formatDate } from '@/lib/storage';

export default function AbsensiPage() {
    const [anggota, setAnggota] = useState([]);
    const [absensi, setAbsensi] = useState([]);
    const [jadwal, setJadwal] = useState([]);
    const [pemenang, setPemenang] = useState([]);
    const [tab, setTab] = useState('input');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [kegiatan, setKegiatan] = useState('Arisan');
    const [keterangan, setKeterangan] = useState('');
    const [filterKegiatan, setFilterKegiatan] = useState('Semua');

    useEffect(() => {
        setAnggota(getAnggota().filter(a => a.status === 'aktif'));
        setAbsensi(getAbsensi());
        setJadwal(getJadwal());
        setPemenang(getPemenang());
    }, []);

    const todayAbsensi = absensi.filter(a => a.tanggal === tanggal && a.kegiatan === kegiatan);

    const setStatus = (anggotaId, nama, status) => {
        const existing = absensi.find(a => a.anggotaId === anggotaId && a.tanggal === tanggal && a.kegiatan === kegiatan);
        let updated;
        if (existing) {
            updated = absensi.map(a =>
                a.id === existing.id ? { ...a, status } : a
            );
        } else {
            const newItem = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                anggotaId, nama, tanggal, kegiatan, status,
                keterangan: keterangan || '',
                createdAt: new Date().toISOString()
            };
            updated = [...absensi, newItem];
        }
        setAbsensi(updated);
        saveAbsensi(updated);
    };

    const getStatusForMember = (anggotaId) => {
        const rec = todayAbsensi.find(a => a.anggotaId === anggotaId);
        return rec?.status || null;
    };

    const statusColors = {
        hadir: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        izin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        sakit: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        alpha: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const statusIcons = {
        hadir: <CheckCircle size={14} />,
        izin: <Clock size={14} />,
        sakit: <AlertTriangle size={14} />,
        alpha: <XCircle size={14} />,
    };

    // Helper to get logo base64
    const getLogoBase64 = async () => {
        try {
            const response = await fetch('/logo.jpg');
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error('Error loading logo:', e);
            return null;
        }
    };

    // === EXPORT PDF REPORT (Laporan) ===
    const exportToPdf = async (targetTanggal, targetKegiatan) => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const logoBase64 = await getLogoBase64();

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        // Logo & Header
        if (logoBase64) doc.addImage(logoBase64, 'JPEG', 14, 8, 20, 20); // Adjusted size/pos

        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.text('DHARMA WANITA PERSATUAN', doc.internal.pageSize.width / 2, 14, { align: 'center' });
        doc.setFontSize(11);
        doc.text('DINAS KESEHATAN KABUPATEN ASAHAN', doc.internal.pageSize.width / 2, 20, { align: 'center' });
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('Jl. Jend. Sudirman No. 5 Kisaran, Sumatera Utara', pageWidth / 2, 25, { align: 'center' });

        doc.setLineWidth(0.8);
        doc.line(14, 28, pageWidth - 14, 28);
        doc.setLineWidth(0.3);
        doc.line(14, 29, pageWidth - 14, 29);

        // Title
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`LAPORAN KEHADIRAN ${targetKegiatan.toUpperCase()}`, pageWidth / 2, 38, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Tanggal: ${formatDate(targetTanggal)}`, pageWidth / 2, 44, { align: 'center' });

        const records = absensi.filter(a => a.tanggal === targetTanggal && a.kegiatan === targetKegiatan);
        const tableData = anggota.map((a, idx) => {
            const rec = records.find(r => r.anggotaId === a.id);
            return [
                idx + 1,
                a.nama,
                a.jabatan,
                rec?.status === 'hadir' ? '✓' : '',
                rec?.status === 'izin' ? '✓' : '',
                rec?.status === 'sakit' ? '✓' : '',
                rec?.status === 'alpha' ? '✓' : '',
            ];
        });

        autoTable(doc, {
            startY: 50,
            head: [['No', 'Nama', 'Jabatan', 'Hadir', 'Izin', 'Sakit', 'Alpha']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1 },
            headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 60 },
                2: { cellWidth: 40 },
                3: { halign: 'center', cellWidth: 15 },
                4: { halign: 'center', cellWidth: 15 },
                5: { halign: 'center', cellWidth: 15 },
                6: { halign: 'center', cellWidth: 15 },
            },
        });

        // Summary & Signatures...
        const finalY = doc.lastAutoTable.finalY + 10;
        const rH = records.filter(r => r.status === 'hadir').length;
        const rI = records.filter(r => r.status === 'izin').length;
        const rS = records.filter(r => r.status === 'sakit').length;
        const rA = records.filter(r => r.status === 'alpha').length;
        doc.text(`Hadir: ${rH}   |   Izin: ${rI}   |   Sakit: ${rS}   |   Alpha: ${rA}   |   Total: ${records.length}`, 14, finalY);

        const sigY = finalY + 15;
        if (sigY + 40 > 280) doc.addPage();

        doc.text('Mengetahui,', 30, sigY);
        doc.text('Kisaran, ..............................', pageWidth - 55, sigY);
        doc.text('Ketua DWP', 30, sigY + 5);
        doc.text('Sekretaris', pageWidth - 55, sigY + 5);
        doc.text('____________________', 20, sigY + 30);
        doc.text('____________________', pageWidth - 65, sigY + 30);

        window.open(doc.output('bloburl'), '_blank');
    };

    // === PRINT DAFTAR HADIR MANUAL (Signature Sheet) ===
    const printDaftarHadir = async (targetTanggal, targetKegiatan) => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const logoBase64 = await getLogoBase64();

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        // Logo & Header
        if (logoBase64) doc.addImage(logoBase64, 'JPEG', 14, 8, 20, 20);

        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.text('DHARMA WANITA PERSATUAN', pageWidth / 2, 14, { align: 'center' });
        doc.setFontSize(11);
        doc.text('DINAS KESEHATAN KABUPATEN ASAHAN', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('Jl. Jend. Sudirman No. 5 Kisaran, Sumatera Utara', pageWidth / 2, 25, { align: 'center' });

        doc.setLineWidth(0.8);
        doc.line(14, 28, pageWidth - 14, 28);
        doc.setLineWidth(0.3);
        doc.line(14, 29, pageWidth - 14, 29);

        // Title
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`DAFTAR HADIR ${targetKegiatan.toUpperCase()}`, pageWidth / 2, 38, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Tanggal: ${formatDate(targetTanggal)}`, pageWidth / 2, 44, { align: 'center' });

        // Table data with signature column
        const tableData = anggota.map((a, idx) => [
            idx + 1,
            a.nama,
            a.jabatan,
            `${idx + 1}. ......................................`
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['No', 'Nama', 'Jabatan', 'Tanda Tangan']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1, valign: 'middle' },
            headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 70 },
                2: { cellWidth: 50 },
                3: { cellWidth: 50, minCellHeight: 12 }, // More height for signature
            },
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        if (finalY + 40 > 280) doc.addPage();

        doc.text('Mengetahui,', 30, finalY);
        doc.text('Kisaran, ..............................', pageWidth - 55, finalY);
        doc.text('Ketua DWP', 30, finalY + 5);
        doc.text('Sekretaris', pageWidth - 55, finalY + 5);
        doc.text('____________________', 20, finalY + 30);
        doc.text('____________________', pageWidth - 65, finalY + 30);

        window.open(doc.output('bloburl'), '_blank');
    };

    // Export Excel
    const exportToExcel = async (targetTanggal, targetKegiatan) => {
        const XLSX = await import('xlsx');
        const records = absensi.filter(a => a.tanggal === targetTanggal && a.kegiatan === targetKegiatan);
        const data = [
            ['DHARMA WANITA PERSATUAN DINAS KESEHATAN KAB. ASAHAN'],
            [`DAFTAR HADIR ${targetKegiatan.toUpperCase()}`],
            [`Tanggal: ${formatDate(targetTanggal)}`],
            [],
            ['No', 'Nama', 'Jabatan', 'Status'],
            ...anggota.map((a, idx) => {
                const rec = records.find(r => r.anggotaId === a.id);
                return [idx + 1, a.nama, a.jabatan, rec?.status || '-'];
            }),
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Absensi');
        XLSX.writeFile(wb, `Absensi_${targetKegiatan}_${targetTanggal}.xlsx`);
    };

    const kegiatanOptions = ['Arisan', 'Rapat', 'Sosial', 'Lainnya'];

    // Calculate percentages for rekap
    const allKegiatan = [...new Set(absensi.map(a => a.kegiatan))];
    const filteredAbsensi = filterKegiatan === 'Semua' ? absensi : absensi.filter(a => a.kegiatan === filterKegiatan);
    const rekapByDate = {};
    filteredAbsensi.forEach(a => {
        const key = `${a.tanggal}|${a.kegiatan}`;
        if (!rekapByDate[key]) rekapByDate[key] = { tanggal: a.tanggal, kegiatan: a.kegiatan, records: [] };
        rekapByDate[key].records.push(a);
    });
    const rekapList = Object.values(rekapByDate).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    const totalHadir = filteredAbsensi.filter(a => a.status === 'hadir').length;
    const totalIzin = filteredAbsensi.filter(a => a.status === 'izin').length;
    const totalSakit = filteredAbsensi.filter(a => a.status === 'sakit').length;
    const totalAlpha = filteredAbsensi.filter(a => a.status === 'alpha').length;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 ">
                <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                    <ClipboardList className="text-primary-400" /> Absensi
                </h1>
                <p className="text-dark-400 mt-1">Input & rekap kehadiran per kegiatan</p>
            </div>

            <div className="flex gap-2 mb-6">
                {['input', 'rekap'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-primary-500 text-white shadow-lg' : 'glass text-dark-300 hover:text-white'}`}>
                        {t === 'input' ? '📝 Input Absensi' : '📊 Rekap & Laporan'}
                    </button>
                ))}
            </div>

            {tab === 'input' && (
                <div className="animate-fade-in">
                    <div className="glass-card p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-dark-400 mb-1 block">Tanggal</label>
                                <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="form-input w-full" />
                            </div>
                            <div>
                                <label className="text-xs text-dark-400 mb-1 block">Kegiatan</label>
                                <select value={kegiatan} onChange={e => setKegiatan(e.target.value)} className="form-input w-full">
                                    {kegiatanOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-dark-400 mb-1 block">Keterangan</label>
                                <input type="text" value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Opsional" className="form-input w-full" />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex gap-4 text-sm text-dark-300">
                                <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-400" /> {todayAbsensi.filter(a => a.status === 'hadir').length}</span>
                                <span className="flex items-center gap-1"><Clock size={14} className="text-blue-400" /> {todayAbsensi.filter(a => a.status === 'izin').length}</span>
                                <span className="flex items-center gap-1"><AlertTriangle size={14} className="text-amber-400" /> {todayAbsensi.filter(a => a.status === 'sakit').length}</span>
                                <span className="flex items-center gap-1"><XCircle size={14} className="text-red-400" /> {todayAbsensi.filter(a => a.status === 'alpha').length}</span>
                            </div>
                            <button onClick={() => printDaftarHadir(tanggal, kegiatan)}
                                className="btn-primary py-2 px-4 shadow-lg shadow-primary-500/20 flex items-center gap-2 text-sm">
                                <Printer size={16} /> Cetak Form Absensi
                            </button>
                        </div>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="max-h-[600px] overflow-y-auto">
                            {anggota.map((a, idx) => {
                                const currentStatus = getStatusForMember(a.id);
                                return (
                                    <div key={a.id} className={`flex items-center gap-3 px-5 py-3 border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors ${currentStatus ? 'bg-dark-800/20' : ''}`}>
                                        <span className="text-dark-500 text-xs w-8 text-right font-mono">{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-white text-sm truncate">{a.nama}</p>
                                                {pemenang.find(p => p.anggotaId === a.id) && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Sudah Menang Arisan">
                                                        <Trophy size={10} />
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-dark-500">{a.jabatan}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {['hadir', 'izin', 'sakit', 'alpha'].map(s => (
                                                <button key={s} onClick={() => setStatus(a.id, a.nama, s)}
                                                    className={`p-2 rounded-lg transition-all ${currentStatus === s ? statusColors[s] : 'text-dark-600 hover:bg-dark-700'}`} title={s}>
                                                    {statusIcons[s]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'rekap' && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="glass-card p-4 text-center border-emerald-500/20"><p className="text-2xl font-bold text-emerald-400">{totalHadir}</p><p className="text-xs text-dark-400">Total Hadir</p></div>
                        <div className="glass-card p-4 text-center border-blue-500/20"><p className="text-2xl font-bold text-blue-400">{totalIzin}</p><p className="text-xs text-dark-400">Total Izin</p></div>
                        <div className="glass-card p-4 text-center border-amber-500/20"><p className="text-2xl font-bold text-amber-400">{totalSakit}</p><p className="text-xs text-dark-400">Total Sakit</p></div>
                        <div className="glass-card p-4 text-center border-red-500/20"><p className="text-2xl font-bold text-red-400">{totalAlpha}</p><p className="text-xs text-dark-400">Total Alpha</p></div>
                    </div>

                    <div className="glass-card p-4 mb-6 flex items-center gap-3 flex-wrap">
                        <Filter size={16} className="text-dark-400" />
                        <span className="text-sm text-dark-300">Filter:</span>
                        {['Semua', ...allKegiatan].map(k => (
                            <button key={k} onClick={() => setFilterKegiatan(k)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterKegiatan === k ? 'bg-primary-500 text-white' : 'glass text-dark-300'}`}>{k}</button>
                        ))}
                    </div>

                    {rekapList.length === 0 ? (
                        <div className="glass-card p-12 text-center text-dark-400"><ClipboardList size={48} className="mx-auto mb-3 opacity-30" /><p>Belum ada data</p></div>
                    ) : (
                        <div className="space-y-4">
                            {rekapList.map(r => {
                                const percentage = r.records.length > 0 ? Math.round((r.records.filter(x => x.status === 'hadir').length / anggota.length) * 100) : 0;
                                return (
                                    <div key={`${r.tanggal}|${r.kegiatan}`} className="glass-card p-5">
                                        <div className="flex justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-dark-600 text-white">{r.kegiatan}</span>
                                                    <span className="text-sm font-semibold text-white">{formatDate(r.tanggal)}</span>
                                                </div>
                                                <div className="flex gap-4 text-xs text-dark-400">
                                                    <span>H: {r.records.filter(x => x.status === 'hadir').length}</span>
                                                    <span>I: {r.records.filter(x => x.status === 'izin').length}</span>
                                                    <span>S: {r.records.filter(x => x.status === 'sakit').length}</span>
                                                    <span>A: {r.records.filter(x => x.status === 'alpha').length}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right"><p className="text-lg font-bold text-emerald-400">{percentage}%</p></div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => printDaftarHadir(r.tanggal, r.kegiatan)} className="p-2 glass hover:text-white" title="Cetak Form"><Printer size={16} /></button>
                                                    <button onClick={() => exportToPdf(r.tanggal, r.kegiatan)} className="p-2 glass hover:text-white" title="Laporan PDF"><FileText size={16} /></button>
                                                    <button onClick={() => exportToExcel(r.tanggal, r.kegiatan)} className="p-2 glass hover:text-white" title="Export Excel"><Download size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }} /></div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
