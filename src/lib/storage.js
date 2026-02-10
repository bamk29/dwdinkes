// localStorage helper - CRUD operations for all data
const isBrowser = typeof window !== 'undefined';

function getItem(key) {
    if (!isBrowser) return null;
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch { return null; }
}

function setItem(key, value) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// === ANGGOTA (Members) ===
export function getAnggota() {
    return getItem('anggota') || [];
}

export function saveAnggota(list) {
    setItem('anggota', list);
}

export function addAnggota(data) {
    const list = getAnggota();
    const newItem = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    list.push(newItem);
    saveAnggota(list);
    return newItem;
}

export function updateAnggota(id, data) {
    const list = getAnggota().map(item => item.id === id ? { ...item, ...data } : item);
    saveAnggota(list);
}

export function deleteAnggota(id) {
    saveAnggota(getAnggota().filter(item => item.id !== id));
}

// === PENGATURAN ARISAN (Settings) ===
export function getPengaturan() {
    return getItem('pengaturan') || {
        periode: '12',
        iuranPerBulan: 65000,
        hadiahArisan: 0,
        tanggalMulai: '2025-01-01',
        tanggalBerakhir: '2025-12-31',
        periodeAktif: 'Periode 2025',
    };
}

export function savePengaturan(data) {
    setItem('pengaturan', data);
}

// === JADWAL (Schedule) ===
export function getJadwal() {
    return getItem('jadwal') || [];
}

export function saveJadwal(list) {
    setItem('jadwal', list);
}

export function addJadwal(data) {
    const list = getJadwal();
    const newItem = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    list.push(newItem);
    saveJadwal(list);
    return newItem;
}

export function updateJadwal(id, data) {
    const list = getJadwal().map(item => item.id === id ? { ...item, ...data } : item);
    saveJadwal(list);
}

export function deleteJadwal(id) {
    saveJadwal(getJadwal().filter(item => item.id !== id));
}

// === RAPAT (Meeting) ===
export function getRapat() {
    return getItem('rapat') || [];
}

export function saveRapat(list) {
    setItem('rapat', list);
}

export function addRapat(data) {
    const list = getRapat();
    const newItem = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    list.push(newItem);
    saveRapat(list);
    return newItem;
}

export function updateRapat(id, data) {
    const list = getRapat().map(item => item.id === id ? { ...item, ...data } : item);
    saveRapat(list);
}

export function deleteRapat(id) {
    saveRapat(getRapat().filter(item => item.id !== id));
}

// === ABSENSI (Attendance) ===
export function getAbsensi() {
    return getItem('absensi') || [];
}

export function saveAbsensi(list) {
    setItem('absensi', list);
}

export function addAbsensi(data) {
    const list = getAbsensi();
    const newItem = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    list.push(newItem);
    saveAbsensi(list);
    return newItem;
}

export function updateAbsensi(id, data) {
    const list = getAbsensi().map(item => item.id === id ? { ...item, ...data } : item);
    saveAbsensi(list);
}

export function deleteAbsensi(id) {
    saveAbsensi(getAbsensi().filter(item => item.id !== id));
}

// === KEUANGAN (Finance) ===
export function getKeuangan() {
    return getItem('keuangan') || [];
}

export function saveKeuangan(list) {
    setItem('keuangan', list);
}

export function addKeuangan(data) {
    const list = getKeuangan();
    const newItem = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    list.push(newItem);
    saveKeuangan(list);
    return newItem;
}

export function updateKeuangan(id, data) {
    const list = getKeuangan().map(item => item.id === id ? { ...item, ...data } : item);
    saveKeuangan(list);
}

export function deleteKeuangan(id) {
    saveKeuangan(getKeuangan().filter(item => item.id !== id));
}

// === PEMENANG ARISAN (Winners) ===
export function getPemenang() {
    return getItem('pemenang') || [];
}

export function savePemenang(list) {
    setItem('pemenang', list);
}

export function addPemenang(data) {
    const list = getPemenang();
    const newItem = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    list.push(newItem);
    savePemenang(list);
    return newItem;
}

// === SUMBANGAN (Donations) ===
export function getSumbangan() {
    return getItem('sumbangan') || [];
}

export function saveSumbangan(list) {
    setItem('sumbangan', list);
}

export function addSumbangan(data) {
    const list = getSumbangan();
    const newItem = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    list.push(newItem);
    saveSumbangan(list);
    return newItem;
}

export function updateSumbangan(id, data) {
    const list = getSumbangan().map(item => item.id === id ? { ...item, ...data } : item);
    saveSumbangan(list);
}

export function deleteSumbangan(id) {
    saveSumbangan(getSumbangan().filter(item => item.id !== id));
}

// === IURAN BULANAN (Monthly Dues) ===
export function getIuranBulanan() {
    return getItem('iuranBulanan') || [];
}

export function saveIuranBulanan(list) {
    setItem('iuranBulanan', list);
}

export function addIuranBulanan(data) {
    const list = getIuranBulanan();
    const newItem = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    list.push(newItem);
    saveIuranBulanan(list);
    return newItem;
}

// === UTILITY ===
export function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
