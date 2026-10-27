# Alur Aplikasi

Skema database terkait ada di [database.md](./database.md).

## 1. Alur pemesanan customer (sudah berjalan di frontend)

```mermaid
flowchart TD
    A[Buka aplikasi] --> B["/menu — Daftar Menu"]
    B --> C{Cari / filter kategori}
    C --> B
    B --> D["Tap + pada item"]
    D --> E["Qty bertambah, badge muncul\ndi tombol + kartu menu"]
    E -->|tambah item lain| B
    E --> F["Floating bar 'Lihat Pesanan'\nmuncul di atas bottom nav"]
    F --> G["Buka sheet Ringkasan Pesanan"]
    G --> H["Atur ulang qty tiap item\n(+/- di dalam sheet)"]
    H --> I["Isi Nomor Meja"]
    I --> J{Nomor meja terisi?}
    J -- belum --> I
    J -- ya --> K["Tekan 'Buat Pesanan'"]
    K --> L["Order dibuat, status: pending\nKeranjang dikosongkan"]
    L --> M["Snackbar konfirmasi tampil"]
    M --> N["Order muncul di tab Pesanan"]
```

Implementasi saat ini (lihat [`DaftarMenu.vue`](../frontend/src/modules/customers/menu/DaftarMenu.vue),
[`OrderSummarySheet.vue`](../frontend/src/modules/customers/menu/OrderSummarySheet.vue),
[`useCart.js`](../frontend/src/modules/customers/menu/useCart.js)) menyimpan keranjang
di memori (tidak ke backend) dan hanya menampilkan snackbar sukses setelah submit — belum benar-benar
mengirim order ke server atau mengisi tab **Pesanan**/**Riwayat**. Bagian "rencana integrasi backend"
di bawah menjelaskan apa yang perlu ditambahkan.

## 2. Status pesanan

```mermaid
stateDiagram-v2
    [*] --> pending: Customer submit order
    pending --> confirmed: Admin/dapur terima order
    confirmed --> preparing: Mulai disiapkan
    preparing --> ready: Siap diantar/diambil
    ready --> completed: Diterima customer / dibayar
    pending --> cancelled: Dibatalkan
    confirmed --> cancelled: Dibatalkan
    completed --> [*]
    cancelled --> [*]
```

Pemetaan ke tab customer:
- **Pesanan** → `pending`, `confirmed`, `preparing`, `ready` (order yang masih berjalan)
- **Riwayat** → `completed`, `cancelled` (order yang sudah final)

## 3. Alur admin/dapur (rencana — modul `frontend/src/modules/admin` masih kosong)

```mermaid
flowchart TD
    A[Login admin] --> B[Dashboard order masuk]
    B --> C["Lihat order baru (status: pending)"]
    C --> D["Terima order → status: confirmed"]
    D --> E["Mulai siapkan → status: preparing"]
    E --> F["Selesai disiapkan → status: ready"]
    F --> G["Order diambil/diantar → status: completed"]
    B --> H[Kelola menu: tambah/edit/nonaktifkan item]
    B --> I[Kelola meja: tambah/nonaktifkan nomor meja]
```

## 4. Rencana integrasi backend (belum dikerjakan)

Langkah yang menghubungkan frontend saat ini ke alur di atas secara nyata:

1. Ganti `menuItems` hardcoded di `DaftarMenu.vue` dengan fetch ke `GET /menu-items` (join `categories`).
2. Saat "Buat Pesanan" ditekan di `OrderSummarySheet.vue`, kirim `POST /orders` berisi `table_number`, `session_id`, dan daftar item keranjang — bukan hanya `clear()` lokal.
3. Simpan `session_id` acak di `localStorage` sekali per perangkat (dibuat saat pertama kali buka app), dikirim di setiap request order.
4. `PesananPage.vue` fetch `GET /orders?session_id=...&status=active` untuk menampilkan order berjalan, idealnya polling atau websocket agar status update (mis. `preparing` → `ready`) terlihat real-time.
5. `RiwayatPage.vue` fetch `GET /orders?session_id=...&status=final`.
6. Modul admin (saat dibangun): halaman daftar order dengan aksi ubah status (`PATCH /orders/:id/status`), dan CRUD menu/kategori/meja.
