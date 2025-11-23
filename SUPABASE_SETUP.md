# Setup Supabase untuk Vyl Bouquet

## 📋 Langkah Setup

### 1. Install Dependencies

```bash
npm install
```

Package yang diinstall:
- `@supabase/supabase-js` - Supabase client untuk storage
- `pg` & `pg-hstore` - PostgreSQL driver untuk Sequelize

### 2. Setup Environment Variables

Buat file `.env.local` di root project dengan isi:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jqwvwrkxzimqcatvcjko.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxd3Z3cmt4emltcWNhdHZjamtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg3ODQzNywiZXhwIjoyMDc5NDU0NDM3fQ.KEogVMoNHM7-7jsffFZswc5tlc6ct1t81hoHfL3KFTk

# Supabase PostgreSQL Database
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.jqwvwrkxzimqcatvcjko
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=postgres

# JWT Secret
JWT_SECRET=your-secret-key-change-this
```

**⚠️ PENTING:** Ganti `YOUR_DATABASE_PASSWORD` dengan password database Supabase Anda!

### 3. Setup Database di Supabase

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Buka **SQL Editor**
4. Copy & paste query dari file yang diberikan sebelumnya
5. Klik **Run** untuk membuat semua tabel

### 4. Setup Storage Bucket di Supabase

1. Di Supabase Dashboard, buka **Storage**
2. Klik **Create a new bucket**
3. Bucket name: `vylbouquet_file`
4. Atur **Public bucket**: ON (agar gambar bisa diakses publik)
5. Klik **Create bucket**

### 5. Setup Storage Policies (IMPORTANT!)

Masih di halaman Storage, klik bucket `vylbouquet_file`, lalu tab **Policies**:

**Policy untuk Upload (INSERT):**
```sql
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'vylbouquet_file');
```

**Policy untuk Read (SELECT):**
```sql
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vylbouquet_file');
```

**Policy untuk Delete:**
```sql
CREATE POLICY "Allow service role delete"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'vylbouquet_file');
```

### 6. Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

## 🔧 Troubleshooting

### Error: "Unable to connect to database"
- Pastikan password database sudah benar di `.env.local`
- Cek koneksi internet
- Cek status Supabase project di dashboard

### Error: "Bucket not found"
- Pastikan bucket `vylbouquet_file` sudah dibuat
- Pastikan bucket di-set sebagai **Public**
- Cek storage policies sudah diterapkan

### Error: "SSL connection required"
- Sudah ditangani di konfigurasi Sequelize
- Jika masih error, coba restart aplikasi

### Upload file gagal
- Cek storage policies sudah diterapkan
- Pastikan service role key sudah benar
- Cek ukuran file tidak melebihi limit

## 📚 Dokumentasi

- Supabase Docs: https://supabase.com/docs
- Sequelize Docs: https://sequelize.org/docs/v6/
- Next.js Docs: https://nextjs.org/docs

## 🚀 Deploy ke Vercel

1. Push code ke GitHub
2. Import project di Vercel
3. Tambahkan Environment Variables di Vercel dashboard
4. Deploy!

Environment variables yang perlu ditambahkan di Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
