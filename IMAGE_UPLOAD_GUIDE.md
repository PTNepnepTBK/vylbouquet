# 📸 Image Upload & Price Format Guide

## ✅ Fitur yang Sudah Diperbaiki

### 1. **Upload Image Bouquet ke Supabase Storage**
Image sekarang tersimpan dengan format URL Supabase:
```
https://jqwvwrkxzimqcatvcjko.supabase.co/storage/v1/object/public/vylbouquet_file/bouquets/1763886847909-d0if35.webp
```

#### Alur Upload:
1. **Client**: User pilih gambar → Kompresi ke WebP (max 1MB)
2. **API**: Upload ke Supabase Storage bucket `vylbouquet_file/bouquets/`
3. **Database**: URL public tersimpan di kolom `image_url`

#### Format Nama File:
- Pattern: `{timestamp}-{random6char}.webp`
- Contoh: `1763886847909-d0if35.webp`

---

### 2. **Format Harga Rupiah di Semua Halaman**

#### Admin Pages:
- ✅ **Bouquets List** (`/bouquets`) - Grid cards dengan harga formatted
- ✅ **Bouquet Modal** (Create/Edit) - Input dengan preview Rupiah
- ✅ **Dashboard Stats** - Average price formatted

#### Customer Pages:
- ✅ **Catalog** (`/catalog`) - Grid cards dengan harga formatted
- ✅ **Order Form** (`/order`) - Dropdown bouquet dengan harga
- ✅ **Order Success** (`/order-success`) - Payment summary formatted

#### Format Function:
```javascript
const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
// Output: Rp150.000
```

---

### 3. **BouquetModal dengan Input Harga yang User-Friendly**

#### Fitur Input Harga:
- **Auto-format**: Hapus karakter non-digit otomatis
- **Live preview**: Tampilkan format Rupiah di bawah input
- **inputMode="numeric"**: Mobile keyboard optimized

#### Contoh UI:
```
┌─────────────────────────────┐
│ Harga *                     │
├─────────────────────────────┤
│ 150000                      │  ← Raw input
├─────────────────────────────┤
│ 💰 Rp150.000                │  ← Live preview
└─────────────────────────────┘
```

---

## 🧪 Testing Checklist

### Upload Image:
- [ ] Buka `/bouquets` → Tambah Buket
- [ ] Upload gambar JPG/PNG (auto-convert ke WebP)
- [ ] Check console: `✅ Image uploaded successfully: https://...`
- [ ] Check database: `image_url` berisi URL Supabase
- [ ] Preview image muncul di card

### Format Harga:
- [ ] Input harga: `150000`
- [ ] Preview show: `💰 Rp150.000`
- [ ] Save dan check di:
  - [ ] Admin bouquets list
  - [ ] Customer catalog
  - [ ] Order form dropdown
  - [ ] Dashboard stats

### Image Display:
- [ ] Admin bouquets grid menampilkan image
- [ ] Customer catalog menampilkan image
- [ ] Order form dropdown (jika ada image preview)

---

## 📂 Files Modified

### Upload System:
- `src/app/api/upload/route.js` - Upload handler
- `src/lib/supabaseStorage.js` - Storage helper
- `src/components/admin/ImageUpload.jsx` - Upload component

### Price Format:
- `src/components/admin/BouquetModal.jsx` - Input with Rupiah preview
- `src/app/(admin)/bouquets/page.jsx` - Already has formatPrice
- `src/app/(customer)/catalog/page.jsx` - Already has formatPrice
- `src/app/(customer)/order/page.jsx` - Already has formatPrice

---

## 🐛 Troubleshooting

### Image tidak tersimpan:
1. Check console browser: ada error upload?
2. Check Supabase bucket exists: `vylbouquet_file`
3. Check bucket is public
4. Check storage policies allow INSERT

### Harga tidak formatted:
1. Check `formatPrice()` function exists
2. Check component imported `formatPrice`
3. Check raw price value is valid number

### Image tidak muncul:
1. Check `image_url` di database bukan NULL
2. Check URL accessible (open in browser)
3. Check CORS policy di Supabase Storage
4. Check Next.js `images.domains` config for Supabase

---

## 🚀 Next Steps

1. **Restart server** untuk load perubahan
2. **Test upload** di admin bouquets
3. **Verify URL** tersimpan di database
4. **Check display** di semua halaman
5. **Create Supabase bucket** jika belum ada:
   ```sql
   -- Run in Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('vylbouquet_file', 'vylbouquet_file', true);
   ```

6. **Set storage policies**:
   ```sql
   -- Allow public read
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'vylbouquet_file');

   -- Allow authenticated insert
   CREATE POLICY "Authenticated Insert"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'vylbouquet_file');
   ```
