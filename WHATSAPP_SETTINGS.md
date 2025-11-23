# 📱 WhatsApp Redirect Settings

## Fitur Baru: Pengaturan Nomor WhatsApp

### 🎯 Fungsi
- Admin dapat mengatur nomor WhatsApp tujuan untuk redirect order
- Customer otomatis diarahkan ke WhatsApp setelah submit pesanan
- Nomor tersimpan dalam format standar: `62xxxxxxxxx`

### 📝 Cara Penggunaan

#### 1. Setting Nomor WhatsApp (Admin)
1. Login ke Admin Panel
2. Buka menu **Settings** (Pengaturan)
3. Scroll ke section **"Pengaturan Redirect WhatsApp"**
4. Input nomor dengan format: `812345678` (tanpa 0 di depan)
   - Input sudah ada prefix **+62** otomatis
   - Jika user masih mengetik `0812345678`, angka 0 otomatis dihapus
5. Klik **Simpan Pengaturan**

#### 2. Format Nomor
- **Input User**: `812345678` atau `0812345678`
- **Tersimpan di Database**: `6289661175822`
- **Digunakan untuk WA**: `https://wa.me/6289661175822?text=...`

### 🔧 Validasi
- ✅ Auto-remove angka 0 di depan
- ✅ Minimal 9 digit, maksimal 13 digit
- ✅ Hanya angka yang diperbolehkan
- ✅ Format tersimpan: `62xxxxxxxxx`

### 📊 Alur Customer Order → WhatsApp
1. Customer isi form order + upload bukti bayar
2. Klik **Submit Pesanan**
3. Order tersimpan ke database
4. **Otomatis buka WhatsApp** dengan pesan pre-filled
5. Customer kirim pesan ke nomor yang sudah di-setting admin
6. Redirect ke halaman **Order Success**

### 💾 Database Structure
```javascript
Setting {
  key: "whatsapp_number",
  value: "6289661175822",  // Format: 62 + nomor tanpa 0
  description: "Nomor WhatsApp untuk redirect order"
}
```

### 🧪 Testing
1. Seed default settings:
   ```bash
   node seed-settings.js
   ```
   Default: `6282002048431`

2. Test di Settings page:
   - Input: `0812345678` → Tersimpan: `6289661175822`
   - Input: `812345678` → Tersimpan: `6289661175822`
   - Input: `62812345678` → Tersimpan: `6289661175822`

3. Test redirect:
   - Submit order di customer page
   - WhatsApp otomatis terbuka dengan nomor dari settings
   - Fallback ke `6289661175822` jika settings kosong

### 📂 File Changes
- `src/app/(admin)/settings/page.jsx` - Input nomor WA dengan validasi
- `src/app/(customer)/order/page.jsx` - Gunakan nomor dari settings
- `seed-settings.js` - Default nomor WA

### 🎨 UI Features
- **Prefix +62** tetap di input (tidak bisa dihapus)
- **Auto-remove 0** saat user ketik
- **Live validation** dengan error message
- **Preview format** yang akan tersimpan
- **Info text** untuk panduan user
