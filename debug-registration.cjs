const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase credentials
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRegistration() {
  console.log('🔍 Debugging client registration...\n');

  try {
    // Test data
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      full_name: 'Test User',
      phone: '+27123456789',
      location: 'Test City'
    };

    console.log('1. Testing auth signup...');
    console.log('Email:', testUser.email);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: testUser.full_name,
          phone: testUser.phone,
          location: testUser.location,
          role: 'client'
        }
      }
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError);
      return;
    }

    console.log('✅ Auth signup successful');
    console.log('User ID:', authData.user?.id);
    console.log('Email confirmed:', authData.user?.email_confirmed_at);

    // Wait a moment for trigger
    console.log('\n2. Waiting for trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if user profile was created
    console.log('\n3. Checking if user profile was created...');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user?.id)
      .single();

    if (profileError) {
      console.error('❌ Error checking user profile:', profileError);
      
      if (profileError.code === 'PGRST116') {
        console.log('ℹ️  User profile not found - trigger may have failed');
        
        // Try to create profile manually
        console.log('\n4. Attempting manual profile creation...');
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user?.id,
            full_name: testUser.full_name,
            email: testUser.email,
            phone: testUser.phone,
            location: testUser.location,
            role: 'client'
          });

        if (insertError) {
          console.error('❌ Manual profile creation failed:', insertError);
        } else {
          console.log('✅ Manual profile creation successful');
        }
      }
    } else {
      console.log('✅ User profile found:', userProfile);
    }

    // Check all users in the table
    console.log('\n5. Checking all users in the table...');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (allUsersError) {
      console.error('❌ Error fetching all users:', allUsersError);
    } else {
      console.log(`✅ Found ${allUsers.length} users in the table:`);
      allUsers.forEach(user => {
        console.log(`   - ${user.full_name} (${user.email}) - ${user.role} - ${user.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugRegistration(); 