# Setup Database & Login Admin

## 1. Setup Database MySQL

Buat database MySQL dengan nama `vyl_buket_db`:

```sql
CREATE DATABASE vyl_buket_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Konfigurasi Database

Edit file `.env.local` dan sesuaikan dengan konfigurasi MySQL Anda:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vyl_buket_db
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your-secret-key-change-this-in-production
```

## 3. Buat Admin Default

Jalankan perintah ini di browser atau Postman:

**Method:** POST  
**URL:** `http://localhost:3000/api/auth/seed-admin`

Atau gunakan curl:

```bash
curl -X POST http://localhost:3000/api/auth/seed-admin
```

Response berhasil:

```json
{
  "success": true,
  "message": "Admin berhasil dibuat",
  "data": {
    "username": "admin",
    "full_name": "Administrator",
    "note": "Password default: admin123"
  }
}
```

## 4. Login ke Admin Panel

Buka browser: `http://localhost:3000/login`

**Kredensial Default:**

- Username: `admin`
- Password: `admin123`

## 5. Struktur Database

Tabel yang akan dibuat otomatis:

- `admins` - Data admin
- `bouquets` - Katalog buket
- `orders` - Data pesanan
- `order_logs` - Log perubahan status pesanan
- `settings` - Pengaturan sistem

## Troubleshooting

### Error: "Cannot connect to database"

- Pastikan MySQL sudah running
- Cek konfigurasi di `.env.local`
- Pastikan database `vyl_buket_db` sudah dibuat

### Error: "Admin sudah ada"

- Admin default sudah dibuat sebelumnya
- Gunakan kredensial: admin / admin123

### Lupa Password

Jalankan query SQL ini untuk reset password admin:

```sql
-- Password akan di-reset ke: admin123
UPDATE admins
SET password = '$2a$10$rBV2WVZhG8qLUEqjK0QqE.YQcBpXCqU7ZKGHxHVbxR5N/xdvC9Lge'
WHERE username = 'admin';
```
