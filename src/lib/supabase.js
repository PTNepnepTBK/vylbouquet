const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials in environment variables');
}

// Create Supabase client with service role for server-side operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test koneksi
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('admins').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
      console.log(`   URL: ${SUPABASE_URL}`);
    }
  } catch (error) {
    console.error('❌ Unable to connect to Supabase:', error.message);
  }
};

testConnection();

module.exports = supabase;
