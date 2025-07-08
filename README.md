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
- **Pengaturan & Ekspor Data:** Personalisasi aplikasi dan ekspor data Anda ke format JSON atau CSV.

## Mode Aplikasi

Aplikasi ini dirancang untuk berjalan sebagai *single-instance* (bukan multi-pengguna) dan tidak memerlukan database eksternal atau layanan autentikasi.

- **Mode Penyimpanan Ganda**:
    1.  **Mode Lokal**: Menggunakan `localStorage` browser, ideal untuk penggunaan pribadi atau demo offline yang persisten di satu perangkat.
    2.  **Mode Server (Demo)**: Menggunakan file `db.json` sebagai database sementara. **PENTING**: Mode ini tidak cocok untuk hosting produksi karena data akan hilang saat server di-restart.

➡️ **Baca panduan deployment di sini: [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## Menjalankan Secara Lokal

1.  **Install dependensi:**
    ```bash
    npm install
    ```
2.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```
    Aplikasi akan tersedia di [http://localhost:9002](http://localhost:9002).
