const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ29tbXF4ZHJ2cGl6bG5saWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAyODQsImV4cCI6MjA2NjAyNjI4NH0.eTLL0v9tR8gfpABablkEtBDm6yr4H_EyvjMYlGIQ3T0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleTest() {
  console.log('🧪 Simple database test...\n');

  try {
    // Test 1: Can we access the users table?
    console.log('1. Testing users table access...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Cannot access users table:', error.message);
      console.log('This means either:');
      console.log('   - The table doesn\'t exist');
      console.log('   - RLS policies are blocking access');
      console.log('   - The table name is wrong');
      return;
    }

    console.log('✅ Users table is accessible');

    // Test 2: Check how many users exist
    console.log('\n2. Counting existing users...');
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting users:', countError.message);
    } else {
      console.log(`✅ Found ${count} users in the table`);
    }

    // Test 3: Try to see some user data
    console.log('\n3. Fetching user data...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .limit(3);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      console.log('✅ User data:', users);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

simpleTest(); 