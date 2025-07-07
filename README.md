# Petrichor - Aplikasi Kasir & Manajemen Kafe

Petrichor adalah aplikasi web lengkap yang dibuat dengan Next.js, dirancang untuk membantu pemilik bisnis F&B (khususnya kafe atau kedai minuman) mengelola operasi harian mereka. Aplikasi ini menyediakan serangkaian fitur yang terintegrasi, mulai dari etalase menu untuk pelanggan hingga dasbor analitik mendalam untuk pemilik.

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

### Prasyarat Penting untuk Produksi

Aplikasi ini menggunakan sistem penyimpanan data dan autentikasi yang **hanya cocok untuk pengembangan** dan **tidak aman untuk produksi.** Sebelum mendeploy untuk penggunaan nyata, Anda **harus** mengganti logika berikut:

1.  **Database Persisten (Wajib):**
    *   **Masalah:** Mode "Server" (`db.json`) dan "Lokal" (Local Storage) tidak persisten di lingkungan hosting modern (Vercel, Firebase App Hosting). Data akan hilang setelah setiap deployment atau restart server.
    *   **Solusi:** Ganti logika di `src/lib/db.ts` dan `src/context/AppContext.tsx` untuk terhubung ke database cloud seperti **Firebase Firestore** (direkomendasikan) atau database SQL (Postgres, MySQL).

2.  **Sistem Autentikasi Nyata (Wajib):**
    *   **Masalah:** Sistem login saat ini adalah **simulasi**. Tidak ada keamanan, tidak ada manajemen pengguna, dan hanya mendukung satu "pengguna" dummy.
    *   **Solusi:** Implementasikan penyedia autentikasi pihak ketiga yang aman seperti **Firebase Authentication** atau **Clerk**. Ini akan menangani pendaftaran pengguna, login, dan keamanan sesi.

### Panduan Implementasi Autentikasi (Contoh dengan Firebase)

1.  **Buat Proyek Firebase:** Buka [Firebase Console](https://console.firebase.google.com/), buat proyek baru, dan aktifkan **Authentication** (dengan penyedia Google) dan **Firestore**.
2.  **Install SDK Firebase:**
    ```bash
    npm install firebase
    ```
3.  **Konfigurasi Firebase:** Buat file konfigurasi di proyek Anda (misalnya, `src/lib/firebase.ts`) dengan kredensial dari proyek Firebase Anda.
4.  **Ganti Logika Login/Logout:**
    *   Di `src/context/AppContext.tsx`, ganti panggilan ke `apiService.login` dan `apiService.logout` dengan fungsi dari SDK Firebase, seperti `signInWithPopup(auth, provider)` dan `signOut(auth)`.
    *   Hapus endpoint API di `/api/user/` yang tidak lagi diperlukan.
5.  **Ikat Data ke Pengguna:**
    *   Saat menyimpan data (misalnya, resep baru di `db.json` atau Firestore), tambahkan field `userId` yang berisi ID unik dari pengguna yang sedang login (`user.uid` dari Firebase).
    *   Saat mengambil data, filter berdasarkan `userId` tersebut. Ini memastikan pengguna hanya dapat melihat dan mengelola data mereka sendiri.

### Opsi Deployment

-   **Vercel (Direkomendasikan):** Hubungkan repositori Git Anda ke Vercel. Ia akan secara otomatis mendeteksi proyek Next.js.
-   **Firebase App Hosting:** Gunakan Firebase CLI untuk deploy. `firebase init apphosting` dan `firebase apphosting:backends:deploy`.

Ingatlah untuk mengatur *Environment Variables* di platform hosting Anda untuk kredensial database dan Firebase.
