const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Supabase configuration
const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';

// Default admin credentials
const adminEmail = 'admin@booksa.com';
const adminPassword = 'admin123456';
const adminName = 'Admin User';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdminUser() {
  try {
    console.log('🔐 Admin User Creation Script');
    console.log('=============================\n');
    
    // Get service role key from user
    const serviceKey = await new Promise((resolve) => {
      rl.question('Enter your Supabase Service Role Key: ', (answer) => {
        resolve(answer.trim());
      });
    });

    if (!serviceKey) {
      console.error('❌ Service role key is required');
      rl.close();
      return;
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    
    console.log('\n🔄 Creating admin user...');
    
    // Step 1: Create the user in Supabase Auth
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
      rl.close();
      return;
    }

    console.log('✅ Auth user created successfully!');

    // Step 2: Add user to the users table with admin role
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: userData.user.id,
        full_name: adminName,
        email: adminEmail,
        role: 'admin'
      });

    if (dbError) {
      console.error('❌ Error adding user to users table:', dbError.message);
      // Try to delete the auth user if db insert fails
      await supabase.auth.admin.deleteUser(userData.user.id);
      rl.close();
      return;
    }

    console.log('✅ User added to users table with admin role!');

    console.log('\n🎉 Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 User ID:', userData.user.id);
    console.log('👑 Role: admin');
    console.log('\n🚨 IMPORTANT: Change these credentials after first login!');
    console.log('\n🔗 You can now login at: http://localhost:8080/admin-login');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

createAdminUser(); 