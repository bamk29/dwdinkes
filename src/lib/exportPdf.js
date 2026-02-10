import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportAbsensiPDF(title, tanggal, dataAbsensi, anggotaList) {
    const doc = new jsPDF();

    // Header / Kop Surat
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DHARMA WANITA PERSATUAN', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('DINAS KESEHATAN KABUPATEN ASAHAN', doc.internal.pageSize.width / 2, 28, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(14, 33, doc.internal.pageSize.width - 14, 33);
    doc.setLineWidth(0.2);
    doc.line(14, 34, doc.internal.pageSize.width - 14, 34);

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title || 'DAFTAR HADIR', doc.internal.pageSize.width / 2, 45, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal: ${tanggal}`, 14, 55);

    // Table
    const tableData = dataAbsensi.map((item, idx) => {
        const anggota = anggotaList.find(a => a.id === item.anggotaId);
        return [
            idx + 1,
            anggota?.nama || '-',
            anggota?.kategori || '-',
            item.status === 'hadir' ? '✓' : '',
            item.status === 'izin' ? '✓' : '',
            item.status === 'sakit' ? '✓' : '',
            item.status === 'alpha' ? '✓' : '',
            ''
        ];
    });

    autoTable(doc, {
        startY: 60,
        head: [['No', 'Nama', 'Kategori', 'Hadir', 'Izin', 'Sakit', 'Alpha', 'Tanda Tangan']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            3: { cellWidth: 14, halign: 'center' },
            4: { cellWidth: 14, halign: 'center' },
            5: { cellWidth: 14, halign: 'center' },
            6: { cellWidth: 14, halign: 'center' },
            7: { cellWidth: 30 },
        },
    });

    // Tanda tangan
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text('Mengetahui,', doc.internal.pageSize.width - 60, finalY);
    doc.text('Ketua DWP Dinkes Asahan', doc.internal.pageSize.width - 70, finalY + 30);
    doc.text('(______________________)', doc.internal.pageSize.width - 70, finalY + 36);

    doc.save(`Absensi_${tanggal}.pdf`);
}

export function exportKeuanganPDF(title, data, periode) {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DHARMA WANITA PERSATUAN', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('DINAS KESEHATAN KABUPATEN ASAHAN', doc.internal.pageSize.width / 2, 28, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(14, 33, doc.internal.pageSize.width - 14, 33);
    doc.setLineWidth(0.2);
    doc.line(14, 34, doc.internal.pageSize.width - 14, 34);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title || 'LAPORAN KEUANGAN', doc.internal.pageSize.width / 2, 45, { align: 'center' });

    if (periode) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Periode: ${periode}`, 14, 55);
    }

    const tableData = data.map((item, idx) => [
        idx + 1,
        item.tanggal,
        item.keterangan,
        item.jenis === 'masuk' ? formatCurrency(item.jumlah) : '',
        item.jenis === 'keluar' ? formatCurrency(item.jumlah) : '',
    ]);

    const totalMasuk = data.filter(d => d.jenis === 'masuk').reduce((s, d) => s + Number(d.jumlah), 0);
    const totalKeluar = data.filter(d => d.jenis === 'keluar').reduce((s, d) => s + Number(d.jumlah), 0);

    tableData.push(['', '', 'TOTAL', formatCurrency(totalMasuk), formatCurrency(totalKeluar)]);
    tableData.push(['', '', 'SALDO', formatCurrency(totalMasuk - totalKeluar), '']);

    autoTable(doc, {
        startY: 60,
        head: [['No', 'Tanggal', 'Keterangan', 'Pemasukan', 'Pengeluaran']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right' },
        },
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text('Bendahara DWP Dinkes Asahan', doc.internal.pageSize.width - 70, finalY + 20);
    doc.text('(______________________)', doc.internal.pageSize.width - 70, finalY + 26);

    doc.save(`Laporan_Keuangan_${periode || 'all'}.pdf`);
}

export function exportArisanPDF(pemenangList, anggotaList, periode) {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DHARMA WANITA PERSATUAN', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('DINAS KESEHATAN KABUPATEN ASAHAN', doc.internal.pageSize.width / 2, 28, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(14, 33, doc.internal.pageSize.width - 14, 33);
    doc.setLineWidth(0.2);
    doc.line(14, 34, doc.internal.pageSize.width - 14, 34);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('REKAP PEMENANG ARISAN', doc.internal.pageSize.width / 2, 45, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${periode}`, 14, 55);

    const tableData = pemenangList.map((item, idx) => {
        const anggota = anggotaList.find(a => a.id === item.anggotaId);
        return [idx + 1, item.tanggal, anggota?.nama || '-', anggota?.kategori || '-', formatCurrency(item.jumlah || 0)];
    });

    autoTable(doc, {
        startY: 60,
        head: [['No', 'Tanggal', 'Pemenang', 'Kategori', 'Jumlah']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            4: { halign: 'right' },
        },
    });

    doc.save(`Rekap_Arisan_${periode}.pdf`);
}

function formatCurrency(val) {
    return new Intl.NumberFormat('id-ID').format(val);
}
