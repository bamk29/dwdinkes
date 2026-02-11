import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LOGO_BASE64 = 'data:image/jpeg;base64,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';

function addHeader(doc, title) {
    const pageWidth = doc.internal.pageSize.width;
    try {
        doc.addImage(LOGO_BASE64, 'JPEG', 14, 10, 20, 20);
    } catch (e) {}

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DHARMA WANITA PERSATUAN', pageWidth / 2 + 10, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text('DINAS KESEHATAN KABUPATEN ASAHAN', pageWidth / 2 + 10, 26, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Sisingamangaraja No. 8 Kisaran, Sumatera Utara', pageWidth / 2 + 10, 31, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(14, 35, pageWidth - 14, 35);
    doc.setLineWidth(0.2);
    doc.line(14, 36, pageWidth - 14, 36);

    if (title) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), pageWidth / 2, 48, { align: 'center' });
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}
export function exportAbsensiPDF(title, tanggal, dataAbsensi, anggotaList) {
    const doc = new jsPDF();
    addHeader(doc, title);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal: ${tanggal}`, 14, 58);

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

    doc.save(`Absensi_${tanggal}.pdf`);
}

function addSignatures(doc, y, tanggal, type = 'default', winnerName = '') {
    const pageWidth = doc.internal.pageSize.width;
    const colHalf = pageWidth / 2;
    const col4 = pageWidth / 4;
    doc.setFontSize(10);

    if (type === 'arisan') {
        doc.setFontSize(9);
        doc.text('Ketua DWP', col4 * 0.5, y, { align: 'center' });
        doc.text('Sekretaris', col4 * 1.5, y, { align: 'center' });
        doc.text('Bendahara', col4 * 2.5, y, { align: 'center' });
        doc.text('Penerima', col4 * 3.5, y, { align: 'center' });

        doc.text('(____________________)', col4 * 0.5, y + 22, { align: 'center' });
        doc.text('(____________________)', col4 * 1.5, y + 22, { align: 'center' });
        doc.text('(____________________)', col4 * 2.5, y + 22, { align: 'center' });
        doc.text(`(${winnerName || '____________________'})`, col4 * 3.5, y + 22, { align: 'center' });
    } else if (type === 'keuangan') {
        doc.text('Ketua DWP', 45, y, { align: 'center' });
        doc.text('Bendahara', pageWidth - 45, y, { align: 'center' });
        doc.text('(______________________)', 45, y + 25, { align: 'center' });
        doc.text('(______________________)', pageWidth - 45, y + 25, { align: 'center' });
    } else {
        // default: Ketua & Sekretaris
        doc.text('Ketua DWP', 45, y, { align: 'center' });
        doc.text(`Kisaran, ${tanggal || '...................'}`, pageWidth - 60, y - 5);
        doc.text('Sekretaris', pageWidth - 45, y, { align: 'center' });
        doc.text('(______________________)', 45, y + 25, { align: 'center' });
        doc.text('(______________________)', pageWidth - 45, y + 25, { align: 'center' });
    }
}

export function exportKeuanganPDF(title, data, periode) {
    const doc = new jsPDF();
    addHeader(doc, title);

    if (periode) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Periode: ${periode}`, 14, 58);
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
    addSignatures(doc, finalY, periode, 'keuangan');

    doc.save(`Laporan_Keuangan_${periode || 'all'}.pdf`);
}

export function exportArisanPDF(pemenangList, anggotaList, periode) {
    const doc = new jsPDF();
    addHeader(doc, 'REKAP PEMENANG ARISAN');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${periode}`, 14, 58);

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

export function exportBeritaAcaraPDF(winner, anggotaList, pengaturan) {
    const doc = new jsPDF();
    const iuran = Number(pengaturan.iuranPerBulan) || 0;
    const total = iuran * anggotaList.length;

    addHeader(doc, 'BERITA ACARA PENARIKAN ARISAN');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pada hari ini tanggal ${formatDate(winner.tanggal)}, telah dilaksanakan penarikan arisan dengan rincian:`, 14, 58);

    const tableData = anggotaList.map((a, idx) => [
        idx + 1,
        a.nama,
        a.jabatan || '-',
        formatCurrency(iuran)
    ]);

    tableData.push(['', '', 'TOTAL TERKUMPUL', formatCurrency(total)]);

    autoTable(doc, {
        startY: 63,
        head: [['No', 'Nama Anggota', 'Jabatan', 'Nilai Iuran']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [255, 170, 0], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            3: { halign: 'right', fontStyle: 'bold' },
        },
        foot: [['', '', 'TOTAL DITERIMA PEMENANG', formatCurrency(winner.jumlah || total)]],
        footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', halign: 'right' }
    });

    const afterTableY = doc.lastAutoTable.finalY + 10;
    doc.text(`Diberikan kepada pemenang:`, 14, afterTableY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${winner.nama}`, 65, afterTableY);
    doc.setFont('helvetica', 'normal');

    const sigY = doc.lastAutoTable.finalY + 25;
    addSignatures(doc, sigY, formatDate(winner.tanggal), 'arisan', winner.nama);

    doc.save(`Berita_Acara_Arisan_${winner.nama}_${winner.tanggal}.pdf`);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function exportSumbanganPDF(title, data, anggotaList) {
    const doc = new jsPDF();
    addHeader(doc, title);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 58);

    const tableData = data.map((item, idx) => {
        const anggota = anggotaList.find(a => a.id === item.anggotaId);
        return [
            idx + 1,
            item.tanggal,
            item.jenis,
            anggota?.nama || '-',
            item.status,
            formatCurrency(item.jumlah || 0)
        ];
    });

    const total = data.reduce((s, d) => s + Number(d.jumlah), 0);
    tableData.push(['', '', '', '', 'TOTAL', formatCurrency(total)]);

    autoTable(doc, {
        startY: 60,
        head: [['No', 'Tanggal', 'Jenis', 'Penerima', 'Status', 'Jumlah']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [244, 63, 94], textColor: 255, fontStyle: 'bold' }, // Rose color for Sumbangan
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            5: { halign: 'right' },
        },
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    addSignatures(doc, finalY, new Date().toLocaleDateString('id-ID'));

    doc.save(`Laporan_Sumbangan.pdf`);
}

export function exportAbsensiRekapPDF(title, data, tanggalCetak) {
    const doc = new jsPDF();
    addHeader(doc, title);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${tanggalCetak}`, 14, 55);

    const tableData = data.map((d, idx) => [
        idx + 1,
        d.nama,
        d.kategori,
        d.h,
        d.i,
        d.s,
        d.al,
        `${d.persen}%`
    ]);

    autoTable(doc, {
        startY: 60,
        head: [['No', 'Nama Anggota', 'Kategori', 'Hadir', 'Izin', 'Sakit', 'Alpha', '%']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [51, 122, 183], textColor: 255 },
        columnStyles: {
            0: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' },
            5: { halign: 'center' },
            6: { halign: 'center' },
            7: { halign: 'center', fontStyle: 'bold' },
        },
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    addSignatures(doc, finalY, tanggalCetak);

    doc.save(`Rekap_Absensi_${new Date().getFullYear()}.pdf`);
}


