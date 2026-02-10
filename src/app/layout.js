import './globals.css';
import Sidebar from '@/components/Sidebar';
import SeedInitializer from '@/components/SeedInitializer';

export const metadata = {
    title: 'Arisan Dharma Wanita - Dinkes Kab. Asahan',
    description: 'Sistem Manajemen Arisan Dharma Wanita Dinas Kesehatan Kabupaten Asahan',
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body>
                <SeedInitializer />
                <Sidebar />
                <main className="lg:ml-[280px] min-h-screen p-4 lg:p-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
