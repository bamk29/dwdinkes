'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Shuffle, Trophy, AlertTriangle, CheckCircle, Users, Crown, Sparkles, Star } from 'lucide-react';
import { getAnggota, getAbsensi, getPemenang, addPemenang, getPengaturan, formatRupiah, formatDate } from '@/lib/storage';

export default function KocokPage() {
    const [anggota, setAnggota] = useState([]);
    const [eligible, setEligible] = useState([]);
    const [pemenang, setPemenang] = useState([]);
    const [absensiHariIni, setAbsensiHariIni] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [displayNames, setDisplayNames] = useState([]);
    const [highlightIdx, setHighlightIdx] = useState(-1);
    const [phase, setPhase] = useState('idle'); // idle, spinning, slowing, winner
    const intervalRef = useRef(null);
    const pengaturan = getPengaturan();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allAnggota = getAnggota().filter(a => a.status === 'aktif');
        const allAbsensi = getAbsensi();
        const allPemenang = getPemenang();
        setAnggota(allAnggota);
        setPemenang(allPemenang);

        const today = new Date().toISOString().split('T')[0];
        const todayAbsensi = allAbsensi.filter(a => a.tanggal === today);
        setAbsensiHariIni(todayAbsensi);

        const hadirIds = todayAbsensi.filter(a => a.status === 'hadir').map(a => a.anggotaId);
        const pemenangIds = allPemenang.map(p => p.anggotaId);
        const eligibleList = allAnggota.filter(a => hadirIds.includes(a.id) && !pemenangIds.includes(a.id));
        setEligible(eligibleList);
        setDisplayNames(eligibleList.map(e => e.nama));
    };

    const startSpin = useCallback(() => {
        if (eligible.length === 0) return;
        setSpinning(true);
        setWinner(null);
        setShowResult(false);
        setPhase('spinning');

        const winIdx = Math.floor(Math.random() * eligible.length);
        const theWinner = eligible[winIdx];
        let count = 0;
        let currentIdx = 0;
        let speed = 50;

        const spin = () => {
            currentIdx = (currentIdx + 1) % eligible.length;
            setHighlightIdx(currentIdx);
            count++;

            if (count > 40) {
                setPhase('slowing');
                speed = Math.min(speed + 15, 400);
            }

            if (count > 60 && currentIdx === eligible.indexOf(theWinner)) {
                clearInterval(intervalRef.current);
                setPhase('winner');
                setWinner(theWinner);
                setShowResult(true);
                setSpinning(false);
                setHighlightIdx(eligible.indexOf(theWinner));

                addPemenang({
                    anggotaId: theWinner.id,
                    nama: theWinner.nama,
                    tanggal: new Date().toISOString().split('T')[0],
                    jumlah: pengaturan.hadiahArisan || (pengaturan.iuranPerBulan * anggota.length),
                });
                setPemenang(getPemenang());
                setEligible(prev => prev.filter(e => e.id !== theWinner.id));
                return;
            }

            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(spin, speed);
        };

        intervalRef.current = setInterval(spin, speed);
    }, [eligible, anggota, pengaturan]);

    const hasAbsensi = absensiHariIni.length > 0;
    const hadirCount = absensiHariIni.filter(a => a.status === 'hadir').length;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 pt-4 lg:pt-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                    <Shuffle className="text-amber-400" /> Kocok Arisan
                </h1>
                <p className="text-dark-400 mt-1">Pengocokan arisan — hanya yang hadir boleh ikut</p>
            </div>

            {/* Status Absensi */}
            <div className={`glass-card p-5 mb-6 border ${hasAbsensi ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
                <div className="flex items-center gap-3">
                    {hasAbsensi ? <CheckCircle size={24} className="text-emerald-400" /> : <AlertTriangle size={24} className="text-amber-400" />}
                    <div>
                        <p className={`font-semibold ${hasAbsensi ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {hasAbsensi ? 'Absensi Hari Ini Tersedia' : 'Belum Ada Absensi Hari Ini'}
                        </p>
                        <p className="text-xs text-dark-400">
                            {hasAbsensi ? `${hadirCount} hadir — ${eligible.length} eligible untuk kocok` : 'Silakan isi absensi terlebih dahulu di menu Absensi'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{anggota.length}</p>
                    <p className="text-xs text-dark-400">Total Anggota</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{pemenang.length}</p>
                    <p className="text-xs text-dark-400">Sudah Menang</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{eligible.length}</p>
                    <p className="text-xs text-dark-400">Eligible Hari Ini</p>
                </div>
            </div>

            {/* ========== LUXURIOUS SLOT MACHINE ========== */}
            <div className="relative mb-8">
                {/* Decorative border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-300/10 to-amber-500/20 blur-xl" />

                <div className="relative glass-card p-8 rounded-3xl border-2 border-amber-500/30 overflow-hidden">
                    {/* Gold decorative corners */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-amber-400/50 rounded-tl-3xl" />
                    <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-amber-400/50 rounded-tr-3xl" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-amber-400/50 rounded-bl-3xl" />
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-amber-400/50 rounded-br-3xl" />

                    {/* Title */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
                            <Crown size={14} className="text-amber-400" />
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Undian Arisan</span>
                            <Crown size={14} className="text-amber-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Dharma Wanita Persatuan</h2>
                        <p className="text-xs text-dark-400">Dinas Kesehatan Kabupaten Asahan</p>
                    </div>

                    {/* Names Display - Roulette Style */}
                    {eligible.length > 0 && (
                        <div className="relative mx-auto max-w-lg mb-8">
                            {/* Gradient masks */}
                            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-dark-800 to-transparent z-10 pointer-events-none rounded-t-2xl" />
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-800 to-transparent z-10 pointer-events-none rounded-b-2xl" />

                            {/* Center highlight bar */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-14 z-10 pointer-events-none">
                                <div className={`h-full rounded-xl border-2 ${phase === 'winner'
                                        ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                                        : spinning
                                            ? 'border-primary-400/50 bg-primary-500/5'
                                            : 'border-dark-600 bg-dark-700/30'
                                    }`} />
                            </div>

                            {/* Scrolling names */}
                            <div className="h-72 overflow-hidden rounded-2xl bg-dark-900/80 border border-dark-700">
                                <div className="flex flex-col items-center justify-center h-full">
                                    {eligible.map((person, idx) => {
                                        const isHighlighted = idx === highlightIdx;
                                        const isWinner = phase === 'winner' && isHighlighted;

                                        return (
                                            <div
                                                key={person.id}
                                                className={`
                          w-full px-6 py-3 text-center transition-all duration-100
                          ${isWinner
                                                        ? 'text-amber-400 text-2xl font-extrabold scale-110 bg-amber-500/10'
                                                        : isHighlighted
                                                            ? 'text-white text-lg font-bold bg-primary-500/10'
                                                            : 'text-dark-500 text-sm'
                                                    }
                        `}
                                            >
                                                <span className={isWinner ? 'animate-pulse' : ''}>
                                                    {isWinner && '🎉 '}{person.nama}{isWinner && ' 🎉'}
                                                </span>
                                                {isWinner && (
                                                    <p className="text-xs text-amber-300 mt-1 font-normal">{person.kategori} • {person.jabatan}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Winner Announcement */}
                    {showResult && winner && (
                        <div className="text-center mb-6 animate-slide-in">
                            <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-2 border-amber-400/40" style={{ boxShadow: '0 0 60px rgba(245,158,11,0.2)' }}>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Star size={20} className="text-amber-400" fill="currentColor" />
                                    <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">Pemenang Arisan</span>
                                    <Star size={20} className="text-amber-400" fill="currentColor" />
                                </div>
                                <p className="text-3xl font-extrabold text-white mb-1">{winner.nama}</p>
                                <p className="text-sm text-dark-300">{winner.kategori} • {winner.jabatan}</p>
                                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/20">
                                    <Sparkles size={14} className="text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">{formatRupiah(pengaturan.hadiahArisan || (pengaturan.iuranPerBulan * anggota.length))}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Kocok Button */}
                    <div className="text-center">
                        <button
                            onClick={startSpin}
                            disabled={!hasAbsensi || eligible.length === 0 || spinning}
                            className={`
                relative inline-flex items-center gap-3 text-lg px-12 py-5 rounded-2xl font-bold
                transition-all duration-300 overflow-hidden
                ${(!hasAbsensi || eligible.length === 0 || spinning)
                                    ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-dark-900 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 active:scale-95'
                                }
              `}
                        >
                            {spinning && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                            )}
                            <Shuffle size={24} className={spinning ? 'animate-spin' : ''} />
                            <span className="relative z-10">
                                {spinning ? 'Mengocok...' : phase === 'winner' ? 'KOCOK LAGI!' : '✨ KOCOK ARISAN! ✨'}
                            </span>
                        </button>

                        {!hasAbsensi && (
                            <p className="text-xs text-amber-400 mt-3">⚠ Isi absensi hari ini terlebih dahulu di menu Absensi</p>
                        )}
                        {hasAbsensi && eligible.length === 0 && (
                            <p className="text-xs text-emerald-400 mt-3">✅ Semua yang hadir sudah mendapat arisan di periode ini</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Riwayat Pemenang */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-amber-400" /> Riwayat Pemenang
                </h2>
                {pemenang.length === 0 ? (
                    <p className="text-center text-dark-400 py-8 text-sm">Belum ada pemenang</p>
                ) : (
                    <div className="space-y-3">
                        {pemenang.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).map((p, i) => (
                            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-dark-900/50 hover:bg-dark-900 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">{p.nama}</p>
                                    <p className="text-xs text-dark-400">{formatDate(p.tanggal)}</p>
                                </div>
                                <span className="text-emerald-400 font-semibold text-sm">{formatRupiah(p.jumlah || 0)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
