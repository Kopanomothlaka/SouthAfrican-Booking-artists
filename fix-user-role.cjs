const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Supabase configuration
const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function fixUserRole() {
  try {
    console.log('🔧 User Role Fix Script');
    console.log('======================\n');
    
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
    
    // Get admin email
    const adminEmail = await new Promise((resolve) => {
      rl.question('Enter admin email (default: admin@booksa.com): ', (answer) => {
        resolve(answer.trim() || 'admin@booksa.com');
      });
    });

    console.log('\n🔄 Checking user in auth...');
    
    // Get user from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      rl.close();
      return;
    }

    const user = authUsers.users.find(u => u.email === adminEmail);
    
    if (!user) {
      console.error('❌ User not found in auth:', adminEmail);
      rl.close();
      return;
    }

    console.log('✅ User found in auth:', user.id);

    // Check if user exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Error checking users table:', userError.message);
      rl.close();
      return;
    }

    if (userData) {
      console.log('✅ User already exists in users table with role:', userData.role);
      
      // Ask if user wants to update role to admin
      const updateRole = await new Promise((resolve) => {
        rl.question('Do you want to update role to admin? (y/n): ', (answer) => {
          resolve(answer.toLowerCase() === 'y');
        });
      });

      if (updateRole) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', user.id);

        if (updateError) {
          console.error('❌ Error updating role:', updateError.message);
        } else {
          console.log('✅ Role updated to admin successfully!');
        }
      }
    } else {
      console.log('❌ User not found in users table, adding...');
      
      // Add user to users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Admin User',
          email: user.email,
          role: 'admin'
        });

      if (insertError) {
        console.error('❌ Error adding user to users table:', insertError.message);
      } else {
        console.log('✅ User added to users table with admin role!');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

fixUserRole(); 