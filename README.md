# vyl_buket_Website

Website pemesanan buket dengan sistem admin panel terintegrasi untuk mengelola pesanan dan pembayaran.

## Fitur Utama

### Customer (Pembeli)
- 📱 Katalog buket interaktif
- 🛒 Form pemesanan dengan opsi DP atau Lunas
- 📸 Upload bukti transfer dan foto referensi
- 💬 Custom request dan kartu ucapan
- ✅ Konfirmasi pesanan via WhatsApp

### Admin Panel
- 📊 **Dashboard** - Ringkasan statistik pesanan hari ini
- 📦 **Manajemen Pesanan** - Kelola semua pesanan dengan filter
- 🔍 **Detail Pesanan** - Informasi lengkap & update status
- 🌸 **Katalog Buket** - Kelola produk buket
- ⚙️ **Pengaturan** - Konfigurasi pembayaran & ketentuan

## Status Pesanan (Workflow)
1. **Menunggu Konfirmasi** - Pesanan baru masuk
2. **Pembayaran Terkonfirmasi** - Admin sudah konfirmasi transfer
3. **Dalam Proses Pembuatan** - Buket sedang dibuat
4. **Siap Diambil** - Buket siap dipickup customer
5. **Selesai** - Transaksi selesai
6. **Dibatalkan** - Order dibatalkan

## Status Pembayaran
- **Belum Lunas** - Masih ada sisa pelunasan (untuk DP)
- **Lunas** - Pembayaran sudah lengkap

## Setup & Installation

### 1. Prerequisites
- Node.js 18+ 
- MySQL 5.7+ (XAMPP/WAMP)
- npm atau yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Jalankan MySQL (XAMPP)
# Buat database
node sync-database.js
```

### 4. Konfigurasi Environment
Buat file `.env.local`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vyl_buket_db
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### 5. Seed Data
```bash
# Seed admin default
Invoke-RestMethod -Method POST http://localhost:3000/api/auth/seed-admin

# Seed settings
node seed-settings.js
```

### 6. Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Login Admin
**URL:** http://localhost:3000/login
- Username: `admin`
- Password: `admin123`

## Struktur Database

### Tabel Utama
- `admins` - Data admin
- `bouquets` - Katalog buket
- `orders` - Data pesanan
- `order_images` - Gambar bukti transfer & referensi
- `order_logs` - Log perubahan status
- `settings` - Pengaturan sistem

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** MySQL dengan Sequelize ORM
- **Styling:** Tailwind CSS
- **Auth:** JWT (jsonwebtoken)
- **Icons:** Heroicons

## Pengaturan Pembayaran Default
- **BCA:** 4373021906 (a.n Vina Enjelia)
- **SeaBank:** 901081198646 (a.n Vina Enjelia)
- **ShopeePay:** 0882002048431 (a.n Vina Enjelia)
- **Minimal DP:** 30%
- **ShopeePay Admin Fee:** Rp 1.000 (dari bank)

## License
MIT License - Lihat file LICENSE

## Developer
Made with ❤️ for Vyl Bouquet