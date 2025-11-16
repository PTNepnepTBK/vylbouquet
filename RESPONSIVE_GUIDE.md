# 📱 Panduan Sistem Responsive - VYL Bouquet Website

## 🎯 Overview

Website ini telah dioptimalkan untuk tampil sempurna di semua perangkat (mobile, tablet, desktop) menggunakan **Mobile-First Responsive Design** seperti Shopee dan Tokopedia.

---

## 🎨 Breakpoints Tailwind CSS

```css
/* Mobile First - Default */
< 640px   : Mobile (base styles)

/* Tablet */
sm: 640px  : Small devices
md: 768px  : Medium devices (tablet)

/* Desktop */
lg: 1024px : Large devices (desktop)
xl: 1280px : Extra large devices
2xl: 1536px: Ultra wide screens
```

---

## 📐 Layout Responsiveness

### 1. **Landing Page (Home)**
✅ **Fitur Responsive:**
- Hero section dengan gradient overlay adaptif
- Typography scaling (3xl → 7xl)
- CTA buttons stack di mobile, side-by-side di desktop
- Feature cards: 1 kolom di mobile, 3 kolom di tablet+
- Padding responsif: `px-4 sm:px-6 md:px-8 lg:px-12`

**Contoh Implementasi:**
```jsx
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
  Rangkaian Bunga Elegan
</h1>
```

---

### 2. **Catalog Page (Katalog Buket)**
✅ **Grid System - Mobile First:**
- **Mobile**: 2 kolom grid dengan gap kecil
- **Tablet**: 2 kolom dengan gap medium
- **Desktop**: 3 kolom dengan gap besar

```jsx
// Grid: 2 kolom mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
```

✅ **Card Optimizations:**
- Image height responsif: `h-40 sm:h-48 md:h-56 lg:h-64`
- Padding adaptif: `p-3 sm:p-4 md:p-5 lg:p-6`
- Typography scaling per breakpoint
- Description hidden di mobile kecil dengan `hidden sm:block`
- Button text singkat di mobile: "Pilih" → "Pilih buket ini"

---

### 3. **Order Page (Form Pemesanan)**
✅ **Layout:**
- Single column di mobile
- 2-column layout di desktop (form:sidebar = 2:1)
- Touch-friendly inputs dengan `touch-target` class

✅ **Form Elements:**
- Input fields dengan padding `py-2.5 md:py-2`
- Labels dengan size `text-xs sm:text-sm`
- Date/Time inputs: stack di mobile, side-by-side di tablet
- File upload dengan `touch-target` untuk tap area 44px minimum

---

### 4. **Navigation (NavBar)**
✅ **Desktop:**
- Logo kiri, menu center, CTA kanan
- Transparent backdrop blur effect
- Center-aligned navigation links

✅ **Mobile:**
- Hamburger menu icon
- Slide-in drawer dari kanan
- Full-screen overlay backdrop
- Menu items dengan touch-friendly spacing
- CTA button di footer drawer

**Mobile Menu Structure:**
```jsx
// Hamburger button
<Bars3Icon className="w-6 h-6" />

// Drawer dengan animation
<div className={`transform transition-transform ${
  isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
}`}>
```

---

### 5. **Admin Panel Layout**
✅ **Desktop:**
- Fixed sidebar 256px width
- Main content dengan left margin

✅ **Mobile:**
- Sidebar hidden default
- Hamburger menu di header
- Slide-in drawer dari kiri
- Backdrop overlay
- Logout button di drawer footer

---

## 🎨 Global CSS Variables

File: `src/app/globals.css`

### CSS Custom Properties:
```css
:root {
  /* Colors */
  --color-primary: #ec4899;
  --color-secondary: #8b5cf6;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  /* Z-index Layers */
  --z-modal: 1050;
  --z-fixed: 1030;
}
```

### Utility Classes:
- `.touch-target` - Minimum 44x44px tap area
- `.glass` - Glassmorphism effect
- `.animate-fade-in` - Fade in animation
- `.animate-slide-in-right` - Slide from right
- `.line-clamp-2` - Text truncate 2 lines

---

## 🧩 Komponen UI Responsive

### Button Component
```jsx
<Button 
  variant="primary"  // primary|secondary|success|danger|outline
  size="md"          // sm|md|lg
  fullWidth={false}  // true untuk full width
>
  Click Me
</Button>
```

**Responsive Behavior:**
- Padding adaptif per size
- Touch-friendly dengan min 44px height
- Hover dan active states
- Disabled state styling

---

### Input Component
```jsx
<Input 
  label="Nama Lengkap"
  size="md"              // sm|md|lg
  icon={UserIcon}        // Optional icon
  helperText="Info"      // Helper text
  error="Error message"  // Error state
  required               // Required indicator
/>
```

**Responsive Behavior:**
- Label size adaptif: `text-xs sm:text-sm`
- Input padding responsif
- Icon positioning adaptif
- Error message dengan icon

---

## 📱 Mobile Optimization Tips

### 1. **Touch Targets**
Semua interactive elements minimum 44x44px:
```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

### 2. **Typography Scaling**
```jsx
// Heading
className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"

// Body text
className="text-sm sm:text-base md:text-lg"

// Small text
className="text-xs sm:text-sm"
```

### 3. **Spacing Adaptif**
```jsx
// Padding
className="p-3 sm:p-4 md:p-6 lg:p-8"

// Gap
className="gap-2 sm:gap-3 md:gap-4 lg:gap-6"

// Margin
className="mb-4 sm:mb-6 md:mb-8 lg:mb-12"
```

### 4. **Grid Responsive**
```jsx
// Mobile-first grid
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// Auto-fit columns
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
```

---

## 🎯 Best Practices

### ✅ DO:
1. **Mobile First** - Style untuk mobile dulu, tambah breakpoint untuk desktop
2. **Touch Friendly** - Minimum 44px tap area
3. **Hide Non-Essential** - Sembunyikan info sekunder di mobile
4. **Stack di Mobile** - Flex column untuk forms dan layouts
5. **Optimize Images** - Gunakan Next.js Image dengan sizes prop
6. **Test Multiple Devices** - Chrome DevTools responsive mode

### ❌ DON'T:
1. **Fixed Width** - Hindari `w-[320px]`, gunakan `max-w-md` atau `w-full`
2. **Tiny Text** - Minimum 12px untuk body text di mobile
3. **Complex Layouts** - Simplify untuk mobile
4. **Small Tap Targets** - Hindari button < 44px
5. **Horizontal Scroll** - Gunakan `overflow-x-hidden`

---

## 🔍 Testing Responsive Design

### Browser DevTools:
```
Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)

Test Devices:
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPad (768x1024)
- Desktop (1920x1080)
```

### Responsive Checklist:
- [ ] Navigation menu berfungsi di mobile
- [ ] Catalog grid 2 kolom di mobile
- [ ] Forms mudah diisi di mobile
- [ ] Buttons touch-friendly
- [ ] Images loading dengan baik
- [ ] Typography readable di semua ukuran
- [ ] No horizontal scroll
- [ ] Admin panel accessible di tablet

---

## 📊 Performance Tips

### 1. **Image Optimization**
```jsx
<Image
  src={imageUrl}
  alt="Description"
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover"
/>
```

### 2. **Lazy Loading**
Semua images sudah otomatis lazy load dengan Next.js Image.

### 3. **CSS Animations**
Gunakan CSS transforms untuk smooth animations:
```css
.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out;
}
```

---

## 🚀 Deployment Checklist

Sebelum deploy, pastikan:
- [ ] Test di Chrome, Safari, Firefox mobile
- [ ] Test landscape & portrait orientation
- [ ] Verify touch targets minimum 44px
- [ ] Check loading states
- [ ] Test forms di mobile
- [ ] Verify navigation di semua breakpoints
- [ ] Test admin panel di tablet
- [ ] Check image loading performance

---

## 📞 Support

Jika ada pertanyaan tentang responsive implementation:
- Cek dokumentasi Tailwind CSS: https://tailwindcss.com/docs/responsive-design
- Review kode di `src/components/` untuk contoh implementasi
- Test dengan Chrome DevTools responsive mode

---

**Dibuat dengan ❤️ untuk VYL Bouquet Website**
*Last Updated: November 2025*
