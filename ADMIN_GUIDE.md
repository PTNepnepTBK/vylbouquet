# Panduan Admin Panel - Vyl Bouquet

## Akses Admin Panel
URL: http://localhost:3000/login
- Username: `admin`
- Password: `admin123`

---

## 1. Dashboard
**URL:** `/dashboard`

### Tampilan
Dashboard menampilkan ringkasan aktivitas toko hari ini dengan 5 kartu statistik:

1. **Menunggu Konfirmasi** - Pesanan baru yang belum dikonfirmasi
2. **Terkonfirmasi** - Pembayaran yang sudah dikonfirmasi
3. **Sedang Dibuat** - Buket dalam proses pembuatan
4. **Siap Diambil** - Buket yang siap dipickup
5. **Selesai** - Transaksi yang sudah selesai

### Tabel Pesanan Terbaru
Menampilkan 10 pesanan terbaru dengan kolom:
- Nama Pembeli
- Buket
- Tanggal Ambil
- Status Pesanan
- Status Pembayaran
- Aksi (link ke Detail)

---

## 2. Manajemen Pesanan
**URL:** `/orders`

### Fitur
- **Search Bar** - Cari berdasarkan nama pembeli atau ID order
- **Filter Status Pesanan** - Filter berdasarkan status order
- **Filter Status Pembayaran** - Filter lunas/belum lunas

### Tabel Lengkap
Kolom yang ditampilkan:
- **ID Order** - Nomor unik pesanan
- **Nama Pembeli** - Nama customer
- **Buket** - Nama buket yang dipesan
- **Harga Total** - Total harga buket
- **Jenis Pembayaran** - DP atau Lunas (+ nominal DP jika applicable)
- **Sisa Pelunasan** - Nominal yang harus dibayar (jika DP)
- **Status Pesanan** - Badge status workflow
- **Status Pembayaran** - Badge lunas/belum lunas
- **Aksi** - Link ke detail pesanan

### Indikator Visual
- 🟡 **Kuning** - Belum Lunas (ada sisa pelunasan)
- 🟢 **Hijau** - Lunas (tidak ada sisa)

---

## 3. Detail Pesanan
**URL:** `/orders/[id]`

### Informasi Lengkap
**Informasi Pembeli:**
- Nama Pembeli
- Nama Pengirim / Rekening Pembeli
- Nomor WhatsApp
- Metode Pembayaran

**Detail Pesanan:**
- Buket yang Dipesan + Harga
- Tanggal & Jam Ambil
- Tulisan Kartu Ucapan
- Request Tambahan

**Informasi Pembayaran:**
- Jenis Pembayaran (DP/Lunas)
- Harga Total
- Nominal DP (jika DP)
- Sisa Pelunasan
- Total Dibayar

**Bukti & Foto:**
- Bukti Transfer (klik untuk zoom)
- Foto Referensi Tambahan

### Aksi yang Tersedia

#### 1. Konfirmasi Pembayaran
**Kapan:** Status = Menunggu Konfirmasi
**Action:** Ubah status → Pembayaran Terkonfirmasi
**Gunakan saat:** Sudah verifikasi bukti transfer valid

#### 2. Tandai Dalam Proses Pembuatan
**Kapan:** Status = Pembayaran Terkonfirmasi
**Action:** Ubah status → Dalam Proses
**Gunakan saat:** Mulai membuat buket

#### 3. Tandai Siap Diambil
**Kapan:** Status = Dalam Proses
**Action:** Ubah status → Siap Diambil
**Gunakan saat:** Buket sudah selesai dibuat

#### 4. Tandai Selesai
**Kapan:** Status = Siap Diambil
**Action:** Ubah status → Selesai
**Gunakan saat:** Customer sudah ambil buket

#### 5. Tandai Pelunasan Sudah Dibayar
**Kapan:** Ada sisa pelunasan & status bukan Cancelled
**Action:** Tandai pembayaran → Lunas
**Gunakan saat:** Customer sudah bayar sisa pelunasan

#### 6. Batalkan Pesanan
**Kapan:** Status bukan Completed/Cancelled
**Action:** Ubah status → Dibatalkan
**Gunakan saat:** Customer cancel atau ada masalah

### Log Perubahan
Setiap perubahan status dicatat dengan:
- Timestamp
- Admin yang mengubah
- Status lama → Status baru

---

## 4. Katalog Buket
**URL:** `/bouquets`

### Fitur
- Grid view produk buket
- Upload gambar buket
- Edit nama, harga, deskripsi
- Hapus buket
- Tombol **Tambah Buket Baru**

### Form Buket
- Upload Gambar
- Nama Buket
- Harga (Rp)
- Deskripsi Singkat

---

## 5. Pengaturan
**URL:** `/settings`

### Pengaturan DP
- **Persentase Minimal DP (%)** - Default: 30%
- Minimal DP yang harus dibayar customer

### Metode Pembayaran

**Rekening BCA**
- Nomor: 4373021906
- Atas Nama: Vina Enjelia

**Rekening SeaBank**
- Nomor: 901081198646
- Atas Nama: Vina Enjelia

**Nomor ShopeePay**
- Nomor: 0882002048431
- Atas Nama: Vina Enjelia

**Catatan ShopeePay**
- "Transfer ShopeePay dari bank +1000 admin"

### Jam Operasional
**Jam Pengambilan:**
- Senin-Sabtu: 08.00-18.00 WIB
- Minggu: 10.00-15.00 WIB

### Tombol Aksi
- **Simpan Pengaturan** - Simpan semua perubahan

---

## Tips & Best Practices

### Workflow Harian
1. Cek Dashboard setiap pagi
2. Konfirmasi pembayaran pesanan baru
3. Update status "Dalam Proses" saat mulai buat
4. Update "Siap Diambil" saat buket selesai
5. Tandai "Selesai" setelah customer pickup

### Penanganan DP
1. Customer pesan dengan DP 30%
2. Konfirmasi DP → status jadi Terkonfirmasi
3. Buat buket → status Dalam Proses
4. Selesai → status Siap Diambil
5. **PENTING:** Sebelum serahkan, cek sisa pelunasan
6. Customer bayar sisa → klik "Tandai Pelunasan Dibayar"
7. Serahkan buket → status Selesai

### Pembatalan
- Jika customer cancel sebelum dibuat, batalkan pesanan
- Jika sudah dalam proses, hubungi customer untuk konfirmasi
- Catat alasan pembatalan di notes

---

## Troubleshooting

### Problem: Tidak bisa login
**Solusi:**
1. Pastikan username & password benar
2. Cek server Next.js sudah running
3. Cek database MySQL aktif

### Problem: Data tidak muncul
**Solusi:**
1. Refresh halaman (F5)
2. Cek koneksi database di terminal
3. Restart server jika perlu

### Problem: Gagal update status
**Solusi:**
1. Pastikan tidak ada error di console browser (F12)
2. Cek koneksi internet
3. Refresh halaman dan coba lagi

---

## Kontak Support
Jika ada masalah teknis, hubungi developer atau cek log error di terminal.

**Made with ❤️ for Vyl Bouquet**
