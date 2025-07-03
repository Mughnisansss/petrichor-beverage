
# SipSavvy - Aplikasi Kasir & Manajemen Kafe

SipSavvy adalah aplikasi web lengkap yang dibuat dengan Next.js, dirancang untuk membantu pemilik bisnis F&B (khususnya kafe atau kedai minuman) mengelola operasi harian mereka. Aplikasi ini menyediakan serangkaian fitur yang terintegrasi, mulai dari etalase menu untuk pelanggan hingga dasbor analitik mendalam untuk pemilik.

## Fitur Utama

- **Dasbor Analitik:** Pantau metrik bisnis utama seperti laba bersih, pendapatan kotor, Harga Pokok Penjualan (HPP), dan biaya operasional. Gunakan filter periode waktu untuk menganalisis tren penjualan harian melalui grafik interaktif dan identifikasi produk terlaris Anda.

- **Menu Order Pelanggan (`/order`):** Sebuah halaman yang berfungsi sebagai etalase digital untuk pelanggan. Menampilkan menu minuman dan makanan dengan desain yang bersih. Pelanggan dapat mengklik produk untuk memilih tambahan (topping) sebelum memasukkannya ke dalam keranjang pesanan.

- **Sistem Kasir (`/kasir`):** Antarmuka Point-of-Sale (POS) yang fleksibel dengan dua mode:
    1.  **Penjualan Cepat:** Tampilan grid untuk semua produk (minuman & makanan) yang memungkinkan kasir mencatat penjualan dengan satu klik.
    2.  **Orderan:** Tab untuk melihat dan memproses pesanan yang masuk dari halaman "Order". Kasir dapat menandai setiap item sebagai "Selesai Dibuat" sebelum memproses seluruh transaksi.

- **Manajemen Produk & Resep (`/racik`):** Kelola resep untuk semua produk minuman dan makanan. Aplikasi ini secara otomatis menghitung HPP untuk setiap item berdasarkan biaya bahan baku yang Anda masukkan, memberi Anda kontrol penuh atas profitabilitas.

- **Manajemen Inventaris:** Lacak semua bahan baku Anda, termasuk biaya pembelian dan satuan. Bahan baku dapat dikategorikan sebagai 'Utama', 'Kemasan', atau 'Topping'. Harga jual untuk topping juga dapat diatur di sini.

- **Pelacakan Biaya Operasional:** Catat semua biaya non-produksi, baik yang bersifat sekali bayar maupun berulang (harian, mingguan, bulanan), untuk memastikan perhitungan laba bersih yang akurat.

- **Pengaturan Fleksibel:** Personalisasi aplikasi dengan mengubah namanya. Ekspor semua data Anda kapan saja dalam format JSON (untuk cadangan penuh) atau CSV (untuk diolah lebih lanjut di spreadsheet).

## Tumpukan Teknologi

- **Framework:** Next.js (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN/UI
- **State Management:** React Context & Hooks

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

## Deployment

### Prasyarat Penting: Database

Aplikasi ini menggunakan file `db.json` (mode "Server") dan Local Storage (mode "Lokal") untuk menyimpan data saat pengembangan. **Kedua mode ini tidak cocok untuk produksi.** Sebagian besar platform hosting (seperti Vercel, Netlify, Firebase App Hosting) memiliki sistem file yang sementara (*ephemeral*), yang berarti setiap data yang disimpan ke `db.json` akan hilang setelah setiap deployment atau restart server. Data di Local Storage terbatas pada satu browser di satu perangkat.

Sebelum mendeploy untuk penggunaan nyata, Anda **harus** mengganti logika di `src/context/AppContext.tsx` dan `src/app/api/` untuk terhubung ke database persisten seperti:
*   **Firebase Firestore** (Direkomendasikan untuk skalabilitas dan fitur real-time)
*   Database SQL (seperti Postgres atau MySQL) yang dihosting di cloud.

### Opsi 1: Deploy ke Vercel (Direkomendasikan)

1.  **Push Kode ke Repositori Git**: Pastikan kode Anda ada di GitHub, GitLab, atau Bitbucket.
2.  **Impor Proyek ke Vercel**: Hubungkan repositori Git Anda ke Vercel. Vercel akan secara otomatis mendeteksi bahwa ini adalah proyek Next.js dan mengonfigurasi pengaturan build.
3.  **Konfigurasi Environment Variables**: Jika Anda sudah beralih ke database, tambahkan kredensial dan konfigurasi yang diperlukan di pengaturan "Environment Variables" proyek Vercel Anda.
4.  **Deploy**: Klik tombol "Deploy". Vercel akan membangun dan mendeploy aplikasi Anda.

### Opsi 2: Deploy ke Firebase App Hosting

1.  **Install Firebase CLI**: `npm install -g firebase-tools`
2.  **Login & Inisialisasi**: Jalankan `firebase login`, lalu `firebase init apphosting` di direktori proyek Anda.
3.  **Deploy**: Jalankan `firebase apphosting:backends:deploy`. Ingat, peringatan mengenai `db.json` juga berlaku di sini.
