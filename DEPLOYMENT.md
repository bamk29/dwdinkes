# Panduan Deployment (Demo Gratis)

Aplikasi ini sudah dikonfigurasi sebagai **Static Web App**, sehingga sangat mudah di-deploy secara gratis. Berikut adalah 2 cara termudah:

## Cara 1: Netlify Drop (Paling Cepat - Tanpa Akun Awal)
Cocok untuk demo instan dalam hitungan detik.

1. Buka folder proyek ini di File Explorer: `D:\PROJECK 2025\ArisanDWDinkesAsahan`
2. Cari folder bernama **`out`**.
3. Buka browser dan pergi ke [https://app.netlify.com/drop](https://app.netlify.com/drop).
4. **Drag & Drop** folder `out` tersebut ke area yang disediakan di browser.
5. Tunggu sebentar, dan website Anda akan langsung online dengan link unik (contoh: `random-name.netlify.app`).

## Cara 2: Vercel (Rekomendasi - Lebih Stabil & Update Mudah)
Cocok untuk jangka panjang dan update fitur otomatis.

### Langkah 1: Push ke GitHub
1. Buat repository baru di [GitHub.com](https://github.com/new). Beri nama misal `arisan-dw-asahan`.
2. Jangan centang "Initialize with README".
3. Copy **URL Repository** (https://github.com/username/repo.git).
4. Buka terminal di folder proyek ini dan jalankan:
   ```bash
   git remote add origin <URL_REPOSITORY_ANDA>
   git branch -M main
   git push -u origin main
   ```

### Langkah 2: Import di Vercel
1. Buka [Vercel.com](https://vercel.com) dan login (bisa pakai akun GitHub).
2. Klik **Add New Project**.
3. Pilih repository `arisan-dw-asahan` yang baru Anda buat, klik **Import**.
4. Di bagian "Framework Preset", pilih **Next.js**.
5. Klik **Deploy**.
6. Tunggu selesai, dan aplikasi siap diakses di `arisan-dw-asahan.vercel.app`.

---

> **Catatan Penting (LocalStorage):**
> Karena aplikasi ini menggunakan penyimpanan lokal browser (localStorage), data yang Anda input saat demo **hanya tersimpan di browser Anda sendiri**. Orang lain yang membuka link demo tidak akan melihat data Anda, dan sebaliknya. Ini sangat aman untuk demo karena data private masing-masing.
