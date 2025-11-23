/**
 * Image Compression Utility
 * Konversi gambar ke WebP dan kompresi sampai ukuran target tercapai
 */

/**
 * Konversi file gambar ke WebP dengan kompresi
 * @param {File} file - File gambar original
 * @param {number} maxSizeKB - Ukuran maksimal dalam KB (500 atau 1000)
 * @returns {Promise<File>} - File WebP yang sudah dikompresi
 */
export async function compressImageToWebP(file, maxSizeKB = 500) {
  return new Promise((resolve, reject) => {
    // Validasi file adalah gambar
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar (JPG, PNG, WebP, dll)'));
      return;
    }

    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      
      img.onload = async () => {
        try {
          // Buat canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set ukuran canvas sama dengan gambar original
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Gambar ke canvas
          ctx.drawImage(img, 0, 0);
          
          // Kompresi bertahap sampai mencapai target size
          let quality = 0.9; // Mulai dengan kualitas 90%
          let blob = null;
          let attempts = 0;
          const maxAttempts = 10;
          const targetSizeBytes = maxSizeKB * 1024;
          
          do {
            // Konversi canvas ke WebP blob
            blob = await new Promise((resolveBlob) => {
              canvas.toBlob(
                (b) => resolveBlob(b),
                'image/webp',
                quality
              );
            });
            
            // Cek ukuran
            if (blob.size <= targetSizeBytes) {
              break;
            }
            
            // Kurangi kualitas untuk iterasi berikutnya
            quality -= 0.1;
            attempts++;
            
            // Jika sudah 10 kali percobaan dan masih terlalu besar,
            // coba resize gambar
            if (attempts === maxAttempts && blob.size > targetSizeBytes) {
              // Resize ke 80% dari ukuran original
              canvas.width = Math.floor(img.width * 0.8);
              canvas.height = Math.floor(img.height * 0.8);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              quality = 0.9; // Reset quality
              attempts = 0; // Reset attempts counter
            }
            
          } while (blob.size > targetSizeBytes && quality > 0.1);
          
          // Buat File object dari blob
          const fileName = file.name.replace(/\.[^/.]+$/, '.webp');
          const compressedFile = new File([blob], fileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          
          console.log(`Kompresi berhasil: ${file.name}`);
          console.log(`Ukuran original: ${(file.size / 1024).toFixed(2)} KB`);
          console.log(`Ukuran akhir: ${(compressedFile.size / 1024).toFixed(2)} KB`);
          console.log(`Kualitas akhir: ${(quality * 100).toFixed(0)}%`);
          
          resolve(compressedFile);
        } catch (error) {
          reject(new Error('Gagal mengkompresi gambar: ' + error.message));
        }
      };
      
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validasi apakah file adalah gambar
 * @param {File} file - File yang akan divalidasi
 * @returns {boolean}
 */
export function isImageFile(file) {
  if (!file) return false;
  
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ];
  
  return validTypes.includes(file.type);
}

/**
 * Validasi dan kompresi multiple files
 * @param {FileList|File[]} files - Array of files
 * @param {number} maxSizeKB - Ukuran maksimal per file dalam KB
 * @returns {Promise<File[]>} - Array of compressed files
 */
export async function compressMultipleImages(files, maxSizeKB = 500) {
  const fileArray = Array.from(files);
  
  // Validasi semua file adalah gambar
  const invalidFiles = fileArray.filter(file => !isImageFile(file));
  if (invalidFiles.length > 0) {
    throw new Error(`File berikut bukan gambar: ${invalidFiles.map(f => f.name).join(', ')}`);
  }
  
  // Kompresi semua gambar secara paralel
  const compressionPromises = fileArray.map(file => 
    compressImageToWebP(file, maxSizeKB)
  );
  
  return Promise.all(compressionPromises);
}

/**
 * Format ukuran file untuk display
 * @param {number} bytes - Ukuran dalam bytes
 * @returns {string} - Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
