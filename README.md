# Petrichor - Aplikasi Kasir & Manajemen Kafe

Petrichor adalah aplikasi web lengkap yang dibuat dengan Next.js, dirancang untuk membantu pemilik bisnis F&B (khususnya kafe atau kedai minuman) mengelola operasi harian mereka secara efisien.

Aplikasi ini menyediakan dasbor analitik, sistem kasir (POS), manajemen produk dan resep dengan perhitungan HPP otomatis, serta halaman pemesanan untuk pelanggan.

---

## Fitur Utama

- **Dasbor Analitik:** Pantau metrik bisnis utama seperti laba bersih, pendapatan kotor, Harga Pokok Penjualan (HPP), dan biaya operasional.
- **Menu Order Pelanggan (`/order`):** Etalase digital untuk pelanggan memesan, lengkap dengan kustomisasi topping dan ukuran.
- **Sistem Kasir (`/kasir`):** Antarmuka Point-of-Sale (POS) dengan mode Penjualan Cepat dan antrian Orderan.
- **Manajemen Produk & Resep (`/racik`):** Kelola minuman dan makanan, atur resep, dan hitung HPP secara otomatis.
- **Manajemen Inventaris & Biaya:** Lacak stok bahan baku dan kelola biaya operasional.
- **Pengaturan & Ekspor Data:** Personalisasi aplikasi, kelola akun pengguna, dan ekspor data Anda ke format JSON atau CSV.

## Status Proyek

Aplikasi ini telah dilengkapi dengan fondasi yang kuat, termasuk:
- **Autentikasi Pengguna** via Firebase Authentication.
- **Alur Pembayaran Langganan** via Stripe.
- **Mode Penyimpanan Ganda**:
    1.  **Mode Lokal**: Menggunakan `localStorage` browser, ideal untuk penggunaan pribadi atau demo offline.
    2.  **Mode Server (Demo)**: Menggunakan file `db.json` sebagai database sementara. **PENTING**: Mode ini tidak cocok untuk produksi karena data akan hilang saat server di-restart.

## Menuju Produksi: Panduan Deployment

Untuk mengubah aplikasi ini dari mode demo menjadi aplikasi produksi multi-pengguna yang siap pakai, Anda **wajib** mengikuti panduan migrasi dan deployment yang telah kami sediakan.

Panduan ini mencakup langkah-langkah krusial seperti:
- Menyiapkan proyek Firebase (Authentication & Firestore).
- Menghubungkan aplikasi ke kredensial Firebase Anda.
- **Memigrasikan penyimpanan data dari `db.json` ke Cloud Firestore (Langkah Wajib).**
- Mengonfigurasi dan mendaftarkan produk di Stripe.
- Melakukan deployment ke platform hosting seperti Vercel atau Firebase App Hosting.

➡️ **Baca panduan lengkapnya di sini: [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## Menjalankan Secara Lokal

1.  **Install dependensi:**
    ```bash
    npm install
    ```
2.  **Konfigurasi Environment Variables**: Salin file `.env.example` menjadi `.env.local` dan isi dengan kredensial Firebase serta kunci Stripe Anda sesuai panduan di `DEPLOYMENT.md`.
3.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```
    Aplikasi akan tersedia di [http://localhost:9002](http://localhost:9002).
