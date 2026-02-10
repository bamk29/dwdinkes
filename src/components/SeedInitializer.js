'use client';
import { useEffect } from 'react';
import { seedAnggota, seedPengaturan } from '@/lib/seedData';

export default function SeedInitializer() {
    useEffect(() => {
        // Only seed if no data exists yet
        const existing = localStorage.getItem('anggota');
        if (!existing || JSON.parse(existing).length === 0) {
            // Seed anggota
            const anggotaWithIds = seedAnggota.map((item, idx) => ({
                ...item,
                id: `seed-${idx + 1}-${Date.now().toString(36)}`,
                createdAt: new Date().toISOString(),
            }));
            localStorage.setItem('anggota', JSON.stringify(anggotaWithIds));

            // Seed pengaturan
            const existingPengaturan = localStorage.getItem('pengaturan');
            if (!existingPengaturan) {
                localStorage.setItem('pengaturan', JSON.stringify(seedPengaturan));
            }

            console.log(`✅ Seed data loaded: ${anggotaWithIds.length} anggota`);
            // Reload to show the data
            window.location.reload();
        }
    }, []);

    return null;
}
