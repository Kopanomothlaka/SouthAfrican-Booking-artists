const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSetup() {
  console.log('Testing database setup...\n');

  try {
    // 1. Test if we can access the users table
    console.log('1. Testing users table access...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ Cannot access users table:', usersError.message);
      console.log('This might be due to RLS policies or missing table');
      return;
    }
    console.log('✅ Users table is accessible');

    // 2. Check if there are any existing users
    console.log('\n2. Checking existing users...');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (allUsersError) {
      console.error('❌ Error fetching users:', allUsersError.message);
    } else {
      console.log(`✅ Found ${allUsers.length} users in the database:`);
      allUsers.forEach(user => {
        console.log(`   - ${user.full_name} (${user.email}) - ${user.role}`);
      });
    }

    // 3. Test if we can read from auth.users (this should work)
    console.log('\n3. Testing auth.users access...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️  No authenticated user (this is normal for testing)');
    } else {
      console.log('✅ Authenticated user found:', user.email);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for the user
console.log('To run this test:');
console.log('1. Replace YOUR_SUPABASE_URL with your actual Supabase URL');
console.log('2. Replace YOUR_SUPABASE_ANON_KEY with your actual anon key');
console.log('3. Run: node test-db-setup.cjs\n');

// Uncomment the line below to run the test
// testDatabaseSetup(); 