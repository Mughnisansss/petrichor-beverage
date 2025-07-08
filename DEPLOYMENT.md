# Panduan Deployment & Migrasi Data

Dokumen ini berisi panduan langkah demi langkah untuk mengubah aplikasi Petrichor dari mode demo menjadi aplikasi multi-pengguna yang siap produksi.

---

## ⚠️ PERINGATAN KRUSIAL: BACA SEBELUM DEPLOYMENT

Aplikasi ini dalam bentuknya saat ini **TIDAK SIAP UNTUK PRODUKSI** jika masih menggunakan mode "Server (Demo)" yang bergantung pada `db.json`. Anda **WAJIB** menyelesaikan langkah-langkah di bawah ini untuk memastikan data pengguna tersimpan secara permanen.

**Masalah**: Sistem penyimpanan data `db.json` bersifat **sementara** (ephemeral). Semua data produk, penjualan, dan inventaris akan **HILANG** saat server di-deploy atau di-restart di platform seperti Vercel, Netlify, atau Firebase App Hosting.

**Solusi**: Anda **HARUS** memigrasikan penyimpanan data ke database persisten yang terhubung dengan akun pengguna. **Cloud Firestore** sangat direkomendasikan karena integrasinya yang erat dengan Firebase Authentication.

---

## Langkah 1: Siapkan Backend di Firebase

1.  Buka [Firebase Console](https://console.firebase.google.com/).
2.  Buat proyek baru atau pilih proyek yang sudah ada.
3.  Di dalam proyek Anda, aktifkan dua layanan utama:
    - **Authentication**: Buka tab "Authentication", klik "Get Started", dan aktifkan penyedia login yang Anda inginkan (misalnya, **Google** dan **Email/Password**).
    - **Firestore Database**: Buka tab "Firestore Database", klik "Create database", mulai dalam **mode produksi (production mode)**, dan pilih lokasi server yang paling sesuai dengan target pengguna Anda.

## Langkah 2: Hubungkan Aplikasi ke Firebase

1.  **Lengkapi Konfigurasi Firebase**. Kredensial proyek Anda dimuat dari *environment variables*. Buat file bernama `.env.local` di folder root proyek Anda dan isi dengan kredensial dari Firebase Console.
    
    *   Buka **Project settings** (ikon gerigi) > **General**.
    *   Di bawah **Your apps**, pilih atau buat aplikasi web baru.
    *   Pilih **SDK setup and configuration** dan salin nilai-nilai konfigurasinya.

    **Contoh file `.env.local`:**
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
    NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef...
    NEXT_PUBLIC_APP_URL=http://localhost:9002
    ```
    *   **Catatan**: `NEXT_PUBLIC_APP_URL` harus diubah menjadi URL aplikasi Anda yang sudah di-deploy saat masuk ke mode produksi. File `.env.local` tidak boleh dimasukkan ke dalam Git repository Anda.

## Langkah 3: Migrasi Penyimpanan Data ke Firestore (WAJIB)

Ini adalah langkah **paling krusial**. Anda harus mengganti semua operasi baca/tulis dari API Routes (`/api/...`) yang menggunakan `db.json` menjadi operasi langsung ke Firestore. Titik utama untuk perubahan ini ada di dalam `src/context/AppContext.tsx`.

1.  **Ubah `storageMode`**: Di aplikasi, navigasi ke `Pengaturan > Manajemen Data` dan ubah `storageMode` ke **"Penyimpanan Browser (Lokal)"**. Ini akan menghentikan pemanggilan ke API `db.json`.

2.  **Ikat Data ke Pengguna**: Modifikasi logika penyimpanan data Anda agar setiap dokumen (misalnya, `drinks`, `foods`, `sales`) memiliki field `userId` yang berisi `auth.currentUser.uid`.

3.  **Query Data Berdasarkan Pengguna**: Saat mengambil data, gunakan query Firestore `where("userId", "==", auth.currentUser.uid)` untuk memastikan setiap pengguna hanya melihat datanya sendiri.

4.  **Contoh Modifikasi di `AppContext.tsx`**:
    *   Alih-alih menggunakan `apiService` atau `localStorageService` yang sudah ada, buatlah `firestoreService`.
    *   Implementasikan fungsi-fungsi seperti `getDrinks`, `addDrink`, `updateDrink`, dll. yang berinteraksi langsung dengan Firestore.

    **Contoh Logika Firestore untuk `getDrinks`:**
    ```typescript
    // Di dalam firestoreService
    import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
    import { db, auth } from '@/lib/firebase'; // Pastikan db dan auth diimpor

    async function getDrinksFromFirestore() {
      const user = auth.currentUser;
      if (!user) return []; // Tidak ada pengguna, tidak ada data

      const q = query(collection(db, "drinks"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    ```

5.  **Hapus API Routes Simulasi**: Setelah semua logika data telah dimigrasikan sepenuhnya ke Firestore, Anda dapat dengan aman menghapus folder `/src/app/api` yang berisi endpoint simulasi.

---

## Langkah 4: Siapkan Integrasi Stripe untuk Langganan

Aplikasi ini sudah dilengkapi dengan alur frontend dan backend untuk menangani pembayaran langganan melalui Stripe. Anda hanya perlu mengonfigurasinya.

1.  **Siapkan Akun Stripe**:
    *   Buat akun di [Stripe](https://dashboard.stripe.com/register).
    *   Buat produk baru di Stripe Dashboard (misalnya, "Langganan Premium") beserta harganya. Catat **Price ID**-nya (terlihat seperti `price_...`).
    *   Ambil kunci API Anda: **Publishable Key** dan **Secret Key**.

2.  **Konfigurasi Environment Variables untuk Stripe**: Tambahkan kunci berikut ke file `.env.local` Anda.
    ```
    # ... variabel Firebase lainnya
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    ```

3.  **Perbarui Price ID**: Buka file `src/app/api/checkout/route.ts` dan ganti nilai placeholder `priceId` dengan Price ID yang Anda dapatkan dari dashboard Stripe.
    ```typescript
    // src/app/api/checkout/route.ts
    const priceId = 'price_xxxxxxxxxxxxxx'; // GANTI DENGAN PRICE ID ANDA
    ```

4.  **Konfigurasi Webhook**:
    *   Setelah aplikasi Anda di-deploy, Anda akan mendapatkan URL publik untuk webhook, yaitu `https://<URL_APLIKASI_ANDA>/api/webhooks/stripe`.
    *   Di Stripe Dashboard, buka **Developers > Webhooks**.
    *   Klik **Add an endpoint**. Masukkan URL webhook di atas.
    *   Klik **Select events** dan pilih `checkout.session.completed`.
    *   Setelah endpoint dibuat, Stripe akan memberikan **Signing secret**. Salin nilai ini dan masukkan ke `STRIPE_WEBHOOK_SECRET` di environment variables Anda.

---

## Langkah 5: Deployment ke Platform Hosting

Setelah migrasi ke Firestore dan konfigurasi Stripe selesai, Anda siap untuk melakukan deployment. Platform seperti **Vercel** atau **Firebase App Hosting** sangat direkomendasikan.

1.  **Dorong Kode ke GitHub**: Pastikan versi terbaru kode Anda ada di repositori GitHub.
2.  **Hubungkan Akun Hosting**:
    -   Buka Vercel atau platform pilihan Anda.
    -   Pilih "Add New Project" dan impor repositori GitHub Anda.
3.  **Konfigurasi Proyek**:
    -   Platform akan otomatis mendeteksi bahwa ini adalah proyek Next.js.
    -   **PENTING: Konfigurasi Environment Variables**. Buka pengaturan proyek di Vercel dan tambahkan **semua** variabel dari file `.env.local` Anda. Ini akan menghubungkan aplikasi Anda yang sudah di-deploy ke proyek Firebase dan akun Stripe Anda.
4.  **Deploy**: Klik tombol "Deploy". Setelah selesai, jangan lupa untuk memperbarui URL webhook di Stripe dengan URL produksi Anda.
