const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Replace with your Supabase URL and service role key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const serviceRoleKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runClientSetup() {
  console.log('🚀 Running Client Setup...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('client-setup.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} had an issue:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1} failed:`, err.message);
        // Continue with other statements
      }
    }

    console.log('\n🎉 Client setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Test client registration at /client-register');
    console.log('2. Test client login at /login');
    console.log('3. Test booking functionality on artist detail pages');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Alternative method using direct SQL execution
async function runClientSetupAlternative() {
  console.log('🚀 Running Client Setup (Alternative Method)...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('client-setup.sql', 'utf8');
    
    console.log('Executing SQL setup...');
    
    // Execute the entire SQL script
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.log('⚠️  Some statements may have had issues:', error.message);
    } else {
      console.log('✅ SQL setup executed successfully');
    }

    console.log('\n🎉 Client setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Test client registration at /client-register');
    console.log('2. Test client login at /login');
    console.log('3. Test booking functionality on artist detail pages');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n💡 If you get an error about exec_sql not existing,');
    console.log('   please run the client-setup.sql script manually in your Supabase SQL editor.');
  }
}

// Run the setup
runClientSetupAlternative(); 