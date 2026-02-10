'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Users, Settings, Shuffle, Calendar,
    FileText, ClipboardCheck, Wallet, Heart, BarChart3, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/anggota', label: 'Anggota', icon: Users },
    { href: '/pengaturan', label: 'Pengaturan Arisan', icon: Settings },
    { href: '/kocok', label: 'Kocok Arisan', icon: Shuffle },
    { href: '/jadwal', label: 'Jadwal Kegiatan', icon: Calendar },
    { href: '/rapat', label: 'Rapat', icon: FileText },
    { href: '/absensi', label: 'Absensi', icon: ClipboardCheck },
    { href: '/keuangan', label: 'Keuangan', icon: Wallet },
    { href: '/sumbangan', label: 'Sumbangan', icon: Heart },
    { href: '/laporan', label: 'Laporan', icon: BarChart3 },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg glass"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-40 h-screen w-[280px]
        bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900
        border-r border-primary-500/10
        flex flex-col
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="p-6 border-b border-primary-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
                            DW
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white leading-tight">Dharma Wanita</h1>
                            <p className="text-[10px] text-primary-300 font-medium">Dinkes Kab. Asahan</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive
                                        ? 'gradient-primary text-white shadow-lg shadow-primary-500/25'
                                        : 'text-dark-400 hover:text-white hover:bg-white/5'
                                    }
                `}
                            >
                                <Icon size={18} className={`${isActive ? 'text-white' : 'text-dark-500 group-hover:text-primary-400'} transition-colors`} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-primary-500/10">
                    <div className="glass-card p-3 text-center">
                        <p className="text-[10px] text-dark-400">Arisan Management System</p>
                        <p className="text-[10px] text-primary-400 font-semibold">v1.0.0</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
