// Simple script to check Supabase configuration
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase Configuration...\n');

if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here') {
  console.log('❌ VITE_SUPABASE_URL is not configured');
  console.log('   Please update your .env file with your actual Supabase URL');
} else {
  console.log('✅ VITE_SUPABASE_URL is configured');
  console.log(`   URL: ${supabaseUrl}`);
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.log('❌ VITE_SUPABASE_ANON_KEY is not configured');
  console.log('   Please update your .env file with your actual Supabase anon key');
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY is configured');
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`);
}

if (supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_url_here' && 
    supabaseAnonKey !== 'your_supabase_anon_key_here') {
  
  console.log('\n🧪 Testing Supabase connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test a simple query
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log('✅ Supabase connection successful!');
    }
  } catch (err) {
    console.log('❌ Supabase connection failed');
    console.log(`   Error: ${err.message}`);
  }
} else {
  console.log('\n⚠️  Cannot test connection - credentials not configured');
}

console.log('\n📝 Next steps:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Copy your Project URL and anon key');
console.log('3. Update your .env file');
console.log('4. Restart your development server');
