import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env manually
const envFile = readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedSettings() {
  try {
    console.log('🌱 Starting settings seed for Supabase...');

    // Default settings data
    const settings = [
      {
        key: 'bank_bca',
        value: '4373021906',
        description: 'Nomor rekening BCA',
      },
      {
        key: 'bank_bca_name',
        value: 'Vina Enjelia',
        description: 'Nama pemilik rekening BCA',
      },
      {
        key: 'bank_seabank',
        value: '901081198646',
        description: 'Nomor rekening SeaBank',
      },
      {
        key: 'bank_seabank_name',
        value: 'Vina Enjelia',
        description: 'Nama pemilik rekening SeaBank',
      },
      {
        key: 'ewallet_shopeepay',
        value: '0882002048431',
        description: 'Nomor ShopeePay',
      },
      {
        key: 'ewallet_shopeepay_name',
        value: 'Vina Enjelia',
        description: 'Nama pemilik ShopeePay',
      },
      {
        key: 'shopeepay_admin_fee',
        value: '1000',
        description: 'Biaya admin ShopeePay jika transfer dari bank (Rp)',
      },
      {
        key: 'min_dp_percent',
        value: '30',
        description: 'Minimal DP dalam persen (%)',
      },
      {
        key: 'whatsapp_number',
        value: '62882002048431',
        description: 'Nomor WhatsApp untuk redirect order (format: 62xxxxxxxxx)',
      },
      {
        key: 'instagram_handle',
        value: '@vylbuket',
        description: 'Username Instagram',
      },
    ];

    // Insert or update settings using upsert
    for (const setting of settings) {
      const { data, error } = await supabase
        .from('settings')
        .upsert(
          {
            key: setting.key,
            value: setting.value,
            description: setting.description,
          },
          { onConflict: 'key' }
        )
        .select();

      if (error) {
        console.error(`❌ Failed to upsert setting ${setting.key}:`, error);
      } else {
        console.log(`✅ Upserted setting: ${setting.key} = ${setting.value}`);
      }
    }

    console.log('\n✅ Settings seed completed successfully!');
    console.log('\n📋 Seeded settings:');
    console.log('  - BCA: 4373021906 (a.n Vina Enjelia)');
    console.log('  - SeaBank: 901081198646 (a.n Vina Enjelia)');
    console.log('  - ShopeePay: 0882002048431 (a.n Vina Enjelia)');
    console.log('  - ShopeePay Admin Fee: Rp 1.000');
    console.log('  - Minimal DP: 30%');
    console.log('  - WhatsApp: 62882002048431');
    console.log(
      '\n💡 Note: Transfer ke ShopeePay dari bank tambah Rp 1.000 untuk admin Shopee'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Settings seed failed:', error);
    process.exit(1);
  }
}

seedSettings();
