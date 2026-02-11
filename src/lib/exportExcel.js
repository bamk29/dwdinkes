import * as XLSX from 'xlsx';

export function exportAbsensiExcel(title, tanggal, dataAbsensi, anggotaList) {
    const wsData = [
        ['DHARMA WANITA PERSATUAN'],
        ['DINAS KESEHATAN KABUPATEN ASAHAN'],
        [''],
        [title || 'DAFTAR HADIR'],
        [`Tanggal: ${tanggal}`],
        [''],
        ['No', 'Nama', 'Kategori', 'Jabatan', 'Status', 'Keterangan'],
    ];

    dataAbsensi.forEach((item, idx) => {
        const anggota = anggotaList.find(a => a.id === item.anggotaId);
        const statusMap = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alpha: 'Tanpa Keterangan' };
        wsData.push([
            idx + 1,
            anggota?.nama || '-',
            anggota?.kategori || '-',
            anggota?.jabatan || '-',
            statusMap[item.status] || item.status,
            item.keterangan || ''
        ]);
    });

    const hadir = dataAbsensi.filter(d => d.status === 'hadir').length;
    const izin = dataAbsensi.filter(d => d.status === 'izin').length;
    const sakit = dataAbsensi.filter(d => d.status === 'sakit').length;
    const alpha = dataAbsensi.filter(d => d.status === 'alpha').length;

    wsData.push([]);
    wsData.push(['', 'Rekap:', '', 'Hadir:', hadir, '']);
    wsData.push(['', '', '', 'Izin:', izin, '']);
    wsData.push(['', '', '', 'Sakit:', sakit, '']);
    wsData.push(['', '', '', 'Alpha:', alpha, '']);
    wsData.push(['', '', '', 'Total:', dataAbsensi.length, '']);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [
        { wch: 5 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Absensi');
    XLSX.writeFile(wb, `Absensi_${tanggal}.xlsx`);
}

export function exportKeuanganExcel(title, data, periode) {
    const wsData = [
        ['DHARMA WANITA PERSATUAN'],
        ['DINAS KESEHATAN KABUPATEN ASAHAN'],
        [''],
        [title || 'LAPORAN KEUANGAN'],
        [`Periode: ${periode || 'Semua'}`],
        [''],
        ['No', 'Tanggal', 'Keterangan', 'Jenis', 'Pemasukan', 'Pengeluaran'],
    ];

    let totalMasuk = 0;
    let totalKeluar = 0;

    data.forEach((item, idx) => {
        const masuk = item.jenis === 'masuk' ? Number(item.jumlah) : 0;
        const keluar = item.jenis === 'keluar' ? Number(item.jumlah) : 0;
        totalMasuk += masuk;
        totalKeluar += keluar;
        wsData.push([idx + 1, item.tanggal, item.keterangan, item.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran', masuk || '', keluar || '']);
    });

    wsData.push([]);
    wsData.push(['', '', 'TOTAL', '', totalMasuk, totalKeluar]);
    wsData.push(['', '', 'SALDO', '', totalMasuk - totalKeluar, '']);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 18 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Keuangan');
    XLSX.writeFile(wb, `Keuangan_${periode || 'all'}.xlsx`);
}

export function exportArisanExcel(pemenangList, anggotaList, periode) {
    const wsData = [
        ['DHARMA WANITA PERSATUAN'],
        ['DINAS KESEHATAN KABUPATEN ASAHAN'],
        [''],
        ['REKAP PEMENANG ARISAN'],
        [`Periode: ${periode}`],
        [''],
        ['No', 'Tanggal', 'Pemenang', 'Kategori', 'Jumlah'],
    ];

    pemenangList.forEach((item, idx) => {
        const anggota = anggotaList.find(a => a.id === item.anggotaId);
        wsData.push([idx + 1, item.tanggal, anggota?.nama || '-', anggota?.kategori || '-', item.jumlah || 0]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 18 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Arisan');
    XLSX.writeFile(wb, `Arisan_${periode}.xlsx`);
}

export function exportSumbanganExcel(title, data, anggotaList) {
    const wsData = [
        ['DHARMA WANITA PERSATUAN'],
        ['DINAS KESEHATAN KABUPATEN ASAHAN'],
        [''],
        [title || 'LAPORAN SUMBANGAN'],
        [`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
        [''],
        ['No', 'Tanggal', 'Jenis', 'Penerima', 'Jabatan', 'Status', 'Jumlah'],
    ];

    let total = 0;
    data.forEach((item, idx) => {
        const anggota = anggotaList.find(a => a.id === item.anggotaId);
        const jumlah = Number(item.jumlah) || 0;
        total += jumlah;
        wsData.push([
            idx + 1,
            item.tanggal,
            item.jenis,
            anggota?.nama || '-',
            anggota?.jabatan || '-',
            item.status,
            jumlah
        ]);
    });

    wsData.push([]);
    wsData.push(['', '', '', '', '', 'TOTAL', total]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
        { wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Sumbangan');
    XLSX.writeFile(wb, `Sumbangan_${new Date().toLocaleDateString('id-ID')}.xlsx`);
}

export function exportAbsensiRekapExcel(title, data, tanggalCetak) {
    const wsData = [
        ['DHARMA WANITA PERSATUAN'],
        ['DINAS KESEHATAN KABUPATEN ASAHAN'],
        [''],
        [title || 'REKAP ABSENSI'],
        [`Tanggal Cetak: ${tanggalCetak}`],
        [''],
        ['No', 'Nama Anggota', 'Kategori', 'Hadir', 'Izin', 'Sakit', 'Alpha', 'Persentase (%)'],
    ];

    data.forEach((d, idx) => {
        wsData.push([
            idx + 1,
            d.nama,
            d.kategori,
            d.h,
            d.i,
            d.s,
            d.al,
            d.persen
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
        { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi');
    XLSX.writeFile(wb, `Rekap_Absensi_${new Date().getFullYear()}.xlsx`);
}
