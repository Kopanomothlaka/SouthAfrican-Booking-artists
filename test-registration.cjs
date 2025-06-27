const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegistration() {
  console.log('🧪 Testing Registration Flow...\n');

  try {
    // Test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testUserData = {
      full_name: 'Test User',
      phone: '+27 123 456 789',
      location: 'Cape Town, South Africa',
      role: 'client'
    };

    console.log('1. Testing user registration...');
    console.log(`   Email: ${testEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: testUserData
      }
    });

    if (authError) {
      console.log('❌ Registration failed:', authError.message);
      return;
    }

    console.log('✅ Auth account created successfully');
    console.log(`   User ID: ${authData.user?.id}`);

    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user profile was created
    console.log('\n2. Checking if user profile was created...');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user?.id)
      .single();

    if (profileError) {
      console.log('❌ Profile check failed:', profileError.message);
    } else if (userProfile) {
      console.log('✅ User profile created successfully');
      console.log('   Profile data:', {
        id: userProfile.id,
        full_name: userProfile.full_name,
        email: userProfile.email,
        role: userProfile.role
      });
    } else {
      console.log('⚠️  User profile not found - trigger might have failed');
    }

    // Test login with the new account
    console.log('\n3. Testing login with new account...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
    } else {
      console.log('✅ Login successful');
      console.log(`   Logged in as: ${loginData.user?.email}`);
    }

    // Clean up - delete the test user
    console.log('\n4. Cleaning up test data...');
    if (authData.user?.id) {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', authData.user.id);
      
      if (deleteError) {
        console.log('⚠️  Could not delete test user profile:', deleteError.message);
      } else {
        console.log('✅ Test user profile deleted');
      }
    }

    console.log('\n🎉 Registration test completed!');
    console.log('\n📋 Results:');
    console.log('- Auth account creation: ✅');
    console.log('- User profile creation: ' + (userProfile ? '✅' : '❌'));
    console.log('- Login functionality: ' + (loginData ? '✅' : '❌'));

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRegistration(); 