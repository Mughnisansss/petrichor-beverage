# Petrichor - Aplikasi Kasir & Manajemen Kafe

Petrichor adalah aplikasi web lengkap yang dibuat dengan Next.js, dirancang untuk membantu pemilik bisnis F&B (khususnya kafe atau kedai minuman) mengelola operasi harian mereka.

---

## ⚠️ PERINGATAN PENTING: KHUSUS UNTUK PENGEMBANGAN

Aplikasi ini dalam bentuknya saat ini **HANYA UNTUK TUJUAN PENGEMBANGAN LOKAL** dan **TIDAK SIAP UNTUK PRODUKSI**. Sebelum di-deploy atau digunakan oleh pengguna nyata, Anda **HARUS** melakukan dua perubahan mendasar:

1.  **Ganti Database**: Sistem penyimpanan data saat ini (`db.json` atau Local Storage) bersifat **sementara** (ephemeral). Data akan **HILANG** saat server di-deploy atau di-restart di platform seperti Vercel, Netlify, atau Firebase App Hosting. Anda harus beralih ke database persisten seperti **Cloud Firestore**.
2.  **Ganti Sistem Akun**: Sistem login saat ini adalah **simulasi satu akun tunggal** dan tidak aman. Anda harus menggantinya dengan layanan autentikasi profesional seperti **Firebase Authentication**.

Panduan untuk melakukan perubahan ini ada di bawah.

---

## Fitur Utama

- **Dasbor Analitik:** Pantau metrik bisnis utama seperti laba bersih, pendapatan kotor, Harga Pokok Penjualan (HPP), dan biaya operasional.
- **Menu Order Pelanggan (`/order`):** Etalase digital untuk pelanggan memesan, lengkap dengan kustomisasi topping.
- **Sistem Kasir (`/kasir`):** Antarmuka Point-of-Sale (POS) dengan mode Penjualan Cepat dan antrian Orderan.
- **Manajemen Produk & Resep (`/racik`):** Kelola resep dan hitung HPP secara otomatis.
- **Manajemen Inventaris & Biaya:** Lacak bahan baku dan biaya operasional.
- **Pengaturan & Ekspor Data:** Personalisasi aplikasi dan ekspor data Anda ke JSON atau CSV.

## Menuju Produksi: Panduan Migrasi & Deployment

Berikut adalah panduan langkah demi langkah untuk mengubah aplikasi ini dari mode pengembangan menjadi aplikasi multi-pengguna yang siap produksi.

### Langkah 1: Siapkan Backend di Firebase

1.  Buka [Firebase Console](https://console.firebase.google.com/).
2.  Buat proyek baru.
3.  Di dalam proyek Anda, aktifkan dua layanan:
    - **Authentication**: Buka tab "Authentication", klik "Get Started", dan aktifkan penyedia login yang Anda inginkan (misalnya, **Google** dan **Email/Password**).
    - **Firestore Database**: Buka tab "Firestore Database", klik "Create database", mulai dalam mode produksi (production mode), dan pilih lokasi server.

### Langkah 2: Hubungkan Aplikasi ke Firebase

1.  **Install Firebase SDK** di proyek Anda:
    ```bash
    npm install firebase
    ```
2.  **Buat file konfigurasi Firebase**. Buat file baru di `src/lib/firebase.ts` dan isi dengan kredensial proyek Anda:
    ```typescript
    // src/lib/firebase.ts
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    // Initialize Firebase
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    export { auth, db };
    ```
    *Catatan: Kita menggunakan `process.env` agar kredensial tetap aman dan tidak terekspos di kode.*

### Langkah 3: Implementasi Autentikasi Nyata

Ganti logika autentikasi simulasi di `src/context/AppContext.tsx` dengan Firebase Authentication.

- **Impor Firebase**: Impor `auth` dari `lib/firebase` dan fungsi-fungsi seperti `onAuthStateChanged`, `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `GoogleAuthProvider`, `signInWithPopup`.
- **Ganti Fungsi**: Ganti fungsi `login`, `register`, dan `logout` untuk menggunakan fungsi dari Firebase SDK.
- **Pantau Status Login**: Gunakan `onAuthStateChanged` untuk memantau status login pengguna secara real-time. Ini akan secara otomatis memperbarui `user` state saat pengguna login atau logout.

### Langkah 4: Migrasi Penyimpanan Data ke Firestore

Ini adalah langkah **paling krusial**. Anda harus mengganti semua operasi baca/tulis dari API Routes (`/api/...`) yang menggunakan `db.json` menjadi operasi ke Firestore.

1.  **Ikat Data ke Pengguna**: Tambahkan field `userId` ke semua tipe data utama di `src/lib/types.ts` (misalnya `Drink`, `Food`, `Sale`). Saat menyimpan data baru, selalu sertakan `auth.currentUser.uid`.
2.  **Query Data Berdasarkan Pengguna**: Saat mengambil data, gunakan query `where("userId", "==", auth.currentUser.uid)` untuk hanya mengambil data milik pengguna yang sedang login.
3.  **Contoh Operasi Firestore**:
    ```typescript
    // Contoh mengganti pengambilan data minuman
    import { collection, query, where, getDocs } from "firebase/firestore";
    import { db, auth } from "@/lib/firebase";

    async function getMyDrinks() {
      const user = auth.currentUser;
      if (!user) return [];

      const q = query(collection(db, "drinks"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      const userDrinks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return userDrinks;
    }
    ```
4.  **Hapus API Routes Simulasi**: Setelah semua logika dipindahkan ke Firestore, Anda dapat menghapus folder `/src/app/api` yang berisi endpoint simulasi.

### Langkah 5: Deployment ke Platform Hosting

Setelah Anda menyelesaikan migrasi ke Firebase, Anda siap untuk melakukan deployment. Platform seperti **Vercel** (dibuat oleh kreator Next.js) atau **Netlify** sangat direkomendasikan.

1.  **Dorong Kode ke GitHub**: Pastikan versi terbaru kode Anda (yang sudah menggunakan Firebase) ada di repositori GitHub.
2.  **Hubungkan Akun Hosting**:
    - Buka Vercel atau Netlify.
    - Pilih "Add New Project" dan impor repositori GitHub Anda.
3.  **Konfigurasi Proyek**:
    - Platform akan otomatis mendeteksi bahwa ini adalah proyek Next.js. Pengaturan build biasanya sudah benar secara default.
    - **PENTING: Konfigurasi Environment Variables**. Buka pengaturan proyek di Vercel/Netlify dan tambahkan semua kredensial Firebase yang Anda gunakan di `firebase.ts` (misalnya `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, dll.). Ini akan menghubungkan aplikasi Anda yang sudah di-deploy ke proyek Firebase Anda.
4.  **Deploy**: Klik tombol "Deploy". Platform akan secara otomatis membangun dan men-deploy aplikasi Anda. Setiap kali Anda melakukan `git push` ke branch utama, deployment baru akan terpicu secara otomatis.

---

## Menjalankan Secara Lokal (Mode Pengembangan)

1.  **Install dependensi:**
    ```bash
    npm install
    ```
2.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```
    Aplikasi akan tersedia di [http://localhost:9002](http://localhost:9002).
