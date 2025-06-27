const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ29tbXF4ZHJ2cGl6bG5saWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAyODQsImV4cCI6MjA2NjAyNjI4NH0.eTLL0v9tR8gfpABablkEtBDm6yr4H_EyvjMYlGIQ3T0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testClientsTable() {
  console.log('🧪 Testing clients table setup...\n');

  try {
    // Test 1: Check if clients table exists and is accessible
    console.log('1. Testing clients table access...');
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Cannot access clients table:', error.message);
      console.log('You need to run the create-clients-table.sql script first');
      return;
    }

    console.log('✅ Clients table is accessible');

    // Test 2: Check how many clients exist
    console.log('\n2. Counting existing clients...');
    const { count, error: countError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting clients:', countError.message);
    } else {
      console.log(`✅ Found ${count} clients in the table`);
    }

    // Test 3: Try to see some client data
    console.log('\n3. Fetching client data...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, full_name, email, created_at')
      .limit(3);

    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError.message);
    } else {
      console.log('✅ Client data:', clients);
    }

    // Test 4: Check if the trigger function exists
    console.log('\n4. Testing trigger function...');
    const { data: triggerTest, error: triggerError } = await supabase
      .rpc('handle_new_client', { NEW: { 
        id: 'test-id', 
        email: 'test@test.com',
        raw_user_meta_data: { 
          full_name: 'Test Client',
          phone: '+27123456789',
          location: 'Test City',
          role: 'client'
        }
      }});

    if (triggerError) {
      console.log('⚠️  Trigger function test (this is normal for anon key):', triggerError.message);
    } else {
      console.log('✅ Trigger function exists and is accessible');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testClientsTable(); 