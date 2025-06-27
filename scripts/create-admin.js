const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  console.log('Please add your service role key to a .env file:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default admin credentials
const adminEmail = 'admin@booksa.com';
const adminPassword = 'admin123456';
const adminName = 'Admin User';

async function createAdminUser() {
  try {
    console.log('🔄 Creating admin user...');
    
    // Create the user with admin role in metadata
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: adminName,
        role: 'admin'
      }
    });

    if (userError) {
      console.error('❌ Error creating admin user:', userError.message);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 User ID:', userData.user.id);
    console.log('\n🚨 IMPORTANT: Change these credentials after first login!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createAdminUser(); 