# Panduan Deployment

Dokumen ini berisi panduan singkat untuk men-deploy aplikasi Petrichor.

---

## Mode Penyimpanan

Aplikasi ini mendukung dua mode penyimpanan yang bisa diatur di `Pengaturan > Manajemen Data`:

1.  **Penyimpanan Browser (Lokal)**: Data disimpan di `localStorage` browser Anda. Mode ini bersifat persisten di satu perangkat, namun tidak dapat dibagikan antar perangkat atau browser.
2.  **Penyimpanan Server (Mode Demo)**: Data dibaca dan ditulis ke file `db.json` di server.

## ⚠️ Peringatan Penting untuk Deployment

Jika Anda men-deploy aplikasi ini ke platform hosting seperti Vercel, Netlify, atau Firebase App Hosting, sistem file mereka umumnya bersifat **sementara (ephemeral)**.

**Ini berarti setiap perubahan yang disimpan ke `db.json` (saat menggunakan mode "Penyimpanan Server") akan HILANG setiap kali server di-restart atau di-deploy ulang.**

**Rekomendasi**:
*   Untuk penggunaan demo online, biarkan data di `db.json` sebagai data awal.
*   Untuk penggunaan pribadi yang persisten, instruksikan pengguna untuk menggunakan mode "Penyimpanan Browser (Lokal)" dan melakukan backup data secara rutin melalui fitur ekspor JSON.

---

## Proses Deployment

1.  **Dorong Kode ke GitHub**: Pastikan versi terbaru kode Anda ada di repositori GitHub.
2.  **Hubungkan Akun Hosting**:
    -   Buka Vercel atau platform pilihan Anda.
    -   Pilih "Add New Project" dan impor repositori GitHub Anda.
3.  **Konfigurasi Proyek**:
    -   Platform akan otomatis mendeteksi bahwa ini adalah proyek Next.js. Tidak ada environment variables khusus yang perlu diatur untuk versi statis ini.
4.  **Deploy**: Klik tombol "Deploy".
