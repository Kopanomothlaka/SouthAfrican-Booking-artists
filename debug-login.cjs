const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ29tbXF4ZHJ2cGl6bG5saWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAyODQsImV4cCI6MjA2NjAyNjI4NH0.eTLL0v9tR8gfpABablkEtBDm6yr4H_EyvjMYlGIQ3T0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugLogin() {
  try {
    console.log('🔍 Debug Login Process');
    console.log('======================\n');
    
    const email = 'admin@booksa.com';
    const password = 'admin123456';
    
    console.log('1️⃣ Attempting to sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Auth Error:', error.message);
      return;
    }

    console.log('✅ Auth successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);

    console.log('\n2️⃣ Checking user role from database...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('❌ Database Error:', userError.message);
      console.error('Error Code:', userError.code);
      return;
    }

    console.log('✅ User data found:');
    console.log('Role:', userData.role);
    console.log('Full Name:', userData.full_name);

    if (userData.role === 'admin') {
      console.log('\n🎉 SUCCESS: User has admin role!');
    } else {
      console.log('\n❌ FAILURE: User does not have admin role');
      console.log('Current role:', userData.role);
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('\n🔒 Signed out');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugLogin(); 