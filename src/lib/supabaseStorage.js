const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqwvwrkxzimqcatvcjko.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxd3Z3cmt4emltcWNhdHZjamtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg3ODQzNywiZXhwIjoyMDc5NDU0NDM3fQ.KEogVMoNHM7-7jsffFZswc5tlc6ct1t81hoHfL3KFTk';
const BUCKET_NAME = 'vylbouquet_file';

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Upload file to Supabase Storage
 * @param {Buffer|File} file - File to upload
 * @param {string} folder - Folder path (e.g., 'bouquets', 'orders')
 * @param {string} filename - Filename with extension
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
async function uploadFile(file, folder, filename) {
  try {
    const filePath = `${folder}/${filename}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream'
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Upload file error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upload multiple files to Supabase Storage
 * @param {Array<Buffer|File>} files - Array of files to upload
 * @param {string} folder - Folder path
 * @returns {Promise<{success: boolean, urls?: Array<string>, errors?: Array}>}
 */
async function uploadMultipleFiles(files, folder) {
  try {
    const uploadPromises = files.map(async (file, index) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const ext = file.name?.split('.').pop() || 'webp';
      const filename = `${timestamp}-${randomString}-${index}.${ext}`;
      
      return uploadFile(file, folder, filename);
    });

    const results = await Promise.all(uploadPromises);
    
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      return {
        success: false,
        errors: errors.map(e => e.error)
      };
    }

    return {
      success: true,
      urls: results.map(r => r.url)
    };
  } catch (error) {
    console.error('Upload multiple files error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete file from Supabase Storage
 * @param {string} filePath - Full path to file in bucket
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteFile(filePath) {
  try {
    // Extract path from URL if full URL is provided
    let path = filePath;
    if (filePath.includes(SUPABASE_URL)) {
      const urlParts = filePath.split(`/${BUCKET_NAME}/`);
      path = urlParts[1];
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Supabase delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete file error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get public URL for a file
 * @param {string} filePath - Path to file in bucket
 * @returns {string} Public URL
 */
function getPublicUrl(filePath) {
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  
  return publicUrl;
}

/**
 * Check if bucket exists and is accessible
 * @returns {Promise<boolean>}
 */
async function checkBucketAccess() {
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
    if (error) {
      console.error('Bucket access error:', error);
      return false;
    }
    console.log('✅ Supabase Storage bucket accessible:', BUCKET_NAME);
    return true;
  } catch (error) {
    console.error('Check bucket error:', error);
    return false;
  }
}

// Test bucket access on module load
checkBucketAccess();

module.exports = {
  supabase,
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getPublicUrl,
  checkBucketAccess,
  BUCKET_NAME
};
