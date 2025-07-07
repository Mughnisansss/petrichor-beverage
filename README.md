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

## Menuju Produksi: Implementasi Multi-Pengguna

**PERINGATAN PENTING:** Sistem akun dan penyimpanan data saat ini adalah **SIMULASI PENGGUNA TUNGGAL** dan **TIDAK AMAN** untuk digunakan di lingkungan produksi. Sebelum aplikasi ini dapat digunakan oleh pengguna nyata atau di-deploy secara online, Anda **HARUS** melakukan dua perubahan mendasar: mengganti sistem autentikasi dan database.

### Konsep Masalah

1.  **Penyimpanan Data Tidak Persisten**: Mode "Server" (`db.json`) dan "Lokal" (Local Storage) bersifat sementara di platform hosting modern (seperti Vercel atau Firebase App Hosting). **Data akan hilang** setiap kali server di-restart atau di-deploy ulang.
2.  **Sistem Akun Tidak Aman**: Sistem login saat ini hanya **mensimulasikan satu akun tunggal**.
    - **Satu Kunci untuk Semua**: Hanya ada satu pasang email dan kata sandi yang dikenali.
    - **Data Tertimpa**: Mendaftarkan "akun" baru akan **menimpa** kredensial login sebelumnya, bukan membuat akun terpisah.
    - **Tidak Ada Privasi Data**: Semua data (produk, penjualan) bersifat global. Tidak ada pemisahan data antar pengguna.

### Panduan Implementasi Sistem Multi-Pengguna (Contoh dengan Firebase)

Berikut adalah panduan langkah demi langkah untuk mengimplementasikan sistem multi-pengguna yang aman menggunakan **Firebase Authentication** dan **Cloud Firestore**.

#### Langkah 1: Siapkan Proyek Firebase
1.  Buka [Firebase Console](https://console.firebase.google.com/).
2.  Buat proyek baru.
3.  Di dalam proyek Anda, aktifkan dua layanan:
    - **Authentication**: Buka tab "Authentication", klik "Get Started", dan aktifkan penyedia login yang Anda inginkan (misalnya, **Google** dan **Email/Password**).
    - **Firestore Database**: Buka tab "Firestore Database", klik "Create database", mulai dalam mode produksi (production mode), dan pilih lokasi server.

#### Langkah 2: Install dan Konfigurasi Firebase SDK
1.  Install Firebase SDK di proyek Anda:
    ```bash
    npm install firebase
    ```
2.  Buat file konfigurasi Firebase di `src/lib/firebase.ts`:
    ```typescript
    // src/lib/firebase.ts
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    export { auth, db };
    ```
    *Ganti `YOUR_...` dengan kredensial dari pengaturan proyek Firebase Anda.*

#### Langkah 3: Ganti Logika Autentikasi
Modifikasi `src/context/AppContext.tsx` untuk menggunakan Firebase, bukan API simulasi.

1.  **Impor Firebase**:
    ```typescript
    // Di bagian atas AppContext.tsx
    import { auth } from '@/lib/firebase'; // Impor auth dari konfigurasi Anda
    import { 
      onAuthStateChanged, 
      signInWithEmailAndPassword, 
      createUserWithEmailAndPassword, 
      signOut 
    } from "firebase/auth";
    ```
2.  **Ganti Fungsi `login`, `register`, `logout`**:
    - Ganti fungsi-fungsi tersebut dengan yang menggunakan Firebase SDK.
    - Gunakan `onAuthStateChanged` untuk memantau status login pengguna secara real-time. Ini akan secara otomatis memperbarui `user` state saat pengguna login atau logout.

#### Langkah 4: Ikat Data ke Pengguna (Data Scoping)
Ini adalah langkah **paling krusial** untuk sistem multi-pengguna.

1.  **Perbarui Tipe Data**: Tambahkan field `userId` opsional ke semua tipe data utama di `src/lib/types.ts` (misalnya `Drink`, `Food`, `Sale`, `RawMaterial`).
    ```typescript
    export interface Drink {
      id: string;
      userId?: string; // Tambahkan ini
      // ... field lainnya
    }
    ```
2.  **Simpan Data dengan `userId`**: Saat menyimpan data baru (misalnya, menambah produk), selalu sertakan ID pengguna yang sedang login.
    ```typescript
    // Contoh saat menambah produk
    const user = auth.currentUser;
    if (user) {
      const productData = {
        // ... data produk
        userId: user.uid, // Simpan ID pengguna
      };
      // Simpan productData ke Firestore
    }
    ```
3.  **Ambil Data Berdasarkan `userId`**: Saat mengambil data dari Firestore, gunakan query `where` untuk hanya mengambil data yang cocok dengan `userId` pengguna yang sedang login.
    ```typescript
    // Contoh saat mengambil daftar produk
    import { collection, query, where, getDocs } from "firebase/firestore";
    
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, "drinks"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userDrinks = querySnapshot.docs.map(doc => doc.data());
      // Set state dengan userDrinks
    }
    ```

Setelah langkah-langkah ini selesai, aplikasi Anda akan memiliki fondasi yang kuat untuk mendukung banyak pengguna dengan data yang aman dan terpisah. Anda kemudian dapat men-deploy-nya ke platform seperti **Vercel** atau **Firebase App Hosting**.
