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

### Langkah 6: Implementasi Langganan Premium Nyata (Contoh: Stripe)

Untuk mengubah fitur langganan dari simulasi menjadi sistem pembayaran nyata, Anda perlu mengintegrasikan gateway pembayaran. Berikut adalah panduan konseptual menggunakan **Stripe**, salah satu gateway pembayaran paling populer.

1.  **Siapkan Akun Stripe**:
    *   Buat akun di [Stripe](https://dashboard.stripe.com/register).
    *   Ambil **Publishable Key** dan **Secret Key** Anda dari dashboard. Simpan di environment variables: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` dan `STRIPE_SECRET_KEY`.
    *   Buat produk baru di Stripe Dashboard (misalnya, "Langganan Premium") beserta harganya. Catat **Price ID**-nya (`price_...`).

2.  **Install Library yang Diperlukan**:
    ```bash
    npm install stripe @stripe/stripe-js
    ```

3.  **Buat Endpoint Checkout (Backend)**:
    Buat API route baru, misalnya di `src/app/api/checkout/route.ts`, untuk membuat sesi pembayaran Stripe.

    ```typescript
    // src/app/api/checkout/route.ts
    import { NextResponse } from 'next/server';
    import { Stripe } from 'stripe';
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    export async function POST(request: Request) {
        const { userId, userEmail } = await request.json(); // Anda perlu mengirim userId dari frontend
        const priceId = 'price_xxxxxxxxxxxxxx'; // Ganti dengan Price ID Anda dari Stripe
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{ price: priceId, quantity: 1 }],
                mode: 'subscription', // atau 'payment' untuk sekali bayar
                success_url: `${appUrl}/pengaturan/akun?payment_success=true`,
                cancel_url: `${appUrl}/pengaturan/akun?payment_canceled=true`,
                // Kirim metadata untuk identifikasi pengguna setelah pembayaran berhasil
                client_reference_id: userId, 
            });

            return NextResponse.json({ sessionId: session.id });
        } catch (error) {
            return NextResponse.json({ message: 'Error creating checkout session' }, { status: 500 });
        }
    }
    ```

4.  **Buat Endpoint Webhook (Backend)**:
    Ini adalah endpoint krusial yang akan dipanggil oleh Stripe setelah pembayaran berhasil. Ini **HARUS** menjadi satu-satunya tempat di mana status langganan pengguna diperbarui.

    ```typescript
    // src/app/api/webhooks/stripe/route.ts
    import { NextResponse } from 'next/server';
    import { Stripe } from 'stripe';
    import { headers } from 'next/headers';
    import { doc, updateDoc } from "firebase/firestore";
    import { db } from '@/lib/firebase'; // Asumsikan Anda menggunakan Firestore

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    export async function POST(request: Request) {
        const body = await request.text();
        const signature = headers().get('stripe-signature') as string;

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
        }
        
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id;

            if (userId) {
                try {
                    // Update status pengguna di Firestore
                    const userRef = doc(db, "users", userId);
                    await updateDoc(userRef, { subscriptionStatus: 'premium' });
                    console.log(`User ${userId} upgraded to premium.`);
                } catch (dbError) {
                    console.error("Error updating user status in DB:", dbError);
                    return new Response('Database update failed', { status: 500 });
                }
            }
        }

        return NextResponse.json({ received: true });
    }
    ```
    *   **Penting**: Daftarkan URL endpoint webhook ini di Stripe Dashboard dan dapatkan `webhookSecret` Anda.

5.  **Perbarui Frontend**:
    Ubah fungsi `handleUpgrade` di halaman akun untuk memanggil endpoint checkout Anda.

    ```typescript
    // Di komponen halaman akun Anda
    import { loadStripe } from '@stripe/stripe-js';

    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

    async function handleRealUpgrade() {
        const stripe = await stripePromise;
        const user = auth.currentUser; // Dapatkan pengguna dari Firebase Auth

        if (!user || !stripe) return;

        // Panggil backend untuk membuat sesi checkout
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid, userEmail: user.email }),
        });

        const { sessionId } = await res.json();

        // Redirect pengguna ke halaman checkout Stripe
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
            console.error(error.message);
            // Tampilkan pesan error ke pengguna
        }
    }
    ```

Dengan mengikuti langkah-langkah ini, Anda akan memiliki sistem langganan yang aman dan siap produksi.

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
