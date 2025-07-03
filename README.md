# Petrichor - Aplikasi Pelacak Penjualan

Ini adalah aplikasi Next.js yang dibuat di Firebase Studio untuk melacak penjualan dan profitabilitas untuk bisnis minuman.

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

Untuk mendeploy aplikasi ini ke lingkungan produksi, ada beberapa langkah yang perlu dipertimbangkan.

### Prasyarat Penting: Database

Aplikasi ini menggunakan file `db.json` untuk menyimpan data saat pengembangan. **Ini tidak cocok untuk produksi.** Sebagian besar platform hosting (seperti Vercel, Netlify, Firebase App Hosting) memiliki sistem file yang sementara (*ephemeral*), yang berarti setiap data yang disimpan ke `db.json` akan hilang setelah setiap deployment atau restart server.

Sebelum mendeploy, Anda **harus** mengganti `src/lib/db.ts` untuk terhubung ke database persisten seperti:
*   **Firebase Firestore** (Direkomendasikan)
*   **Firebase Realtime Database**
*   Database SQL (seperti Postgres atau MySQL) yang dihosting di cloud.

### Opsi 1: Deploy ke Vercel (Direkomendasikan untuk Next.js)

Vercel adalah platform dari pembuat Next.js dan menawarkan integrasi yang sangat baik.

1.  **Push Kode ke Repositori Git**: Pastikan kode Anda ada di GitHub, GitLab, atau Bitbucket.
2.  **Buat Akun Vercel**: Daftar di [vercel.com](https://vercel.com).
3.  **Impor Proyek**:
    *   Dari dashboard Vercel Anda, klik "Add New... > Project".
    *   Impor repositori Git Anda.
    *   Vercel akan secara otomatis mendeteksi bahwa ini adalah proyek Next.js dan mengonfigurasi pengaturan build.
4.  **Konfigurasi Environment Variables**: Jika Anda sudah beralih ke database (seperti Firebase), tambahkan kredensial dan konfigurasi yang diperlukan di pengaturan "Environment Variables" proyek Vercel Anda.
5.  **Deploy**: Klik tombol "Deploy". Vercel akan membangun dan mendeploy aplikasi Anda.

### Opsi 2: Deploy ke Firebase App Hosting

Anda juga dapat mendeploy aplikasi ini menggunakan Firebase App Hosting.

1.  **Install Firebase CLI**: Jika belum, install Firebase CLI secara global:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login ke Firebase**:
    ```bash
    firebase login
    ```
3.  **Inisialisasi Firebase**: Jika ini adalah proyek Firebase baru, jalankan `firebase init apphosting` di direktori proyek Anda dan ikuti petunjuknya.
4.  **Deploy**: Jalankan perintah berikut untuk mendeploy:
    ```bash
    firebase apphosting:backends:deploy
    ```
    Firebase CLI akan mengurus proses build dan deployment. Ingat, masalah `db.json` yang sama juga berlaku di sini.
