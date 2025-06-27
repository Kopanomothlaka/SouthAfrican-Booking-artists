const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testClientRegistration() {
  console.log('Testing client registration...\n');

  try {
    // 1. Check if users table exists and has correct structure
    console.log('1. Checking users table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accessing users table:', tableError);
      return;
    }
    console.log('✅ Users table is accessible');

    // 2. Check RLS policies on users table
    console.log('\n2. Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'users' });

    if (policyError) {
      console.log('⚠️  Could not check policies (this is normal for anon key):', policyError.message);
    } else {
      console.log('✅ RLS policies:', policies);
    }

    // 3. Test inserting a test user (this should fail with anon key due to RLS)
    console.log('\n3. Testing insert with anon key (should fail due to RLS)...');
    const testUser = {
      id: 'test-user-id',
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '+27123456789',
      location: 'Test City',
      role: 'client',
      created_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testUser);

    if (insertError) {
      console.log('✅ Insert blocked by RLS (expected):', insertError.message);
    } else {
      console.log('❌ Insert succeeded (unexpected)');
    }

    // 4. Check if there's a trigger on auth.users
    console.log('\n4. Checking for auth trigger...');
    const { data: triggers, error: triggerError } = await supabase
      .rpc('get_triggers');

    if (triggerError) {
      console.log('⚠️  Could not check triggers (this is normal for anon key):', triggerError.message);
    } else {
      console.log('✅ Triggers:', triggers);
    }

    // 5. Check existing users
    console.log('\n5. Checking existing users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log('✅ Existing users:', users);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testClientRegistration(); 