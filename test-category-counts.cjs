const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qwertyuiopasdfghjklzxcvbnm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZXJ0eXVpb3Bhc2RmZ2hqa2x6eGN2Ym5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.qwertyuiopasdfghjklzxcvbnm';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCategoryCounts() {
  console.log('🔍 Testing Category Counts...\n');

  try {
    // First, let's see what's in the bookings table
    console.log('📋 Checking all bookings:');
    const { data: allBookings, error: allError } = await supabase
      .from('bookings')
      .select('*');

    if (allError) {
      console.error('❌ Error fetching all bookings:', allError);
      return;
    }

    console.log(`Total bookings: ${allBookings.length}`);
    
    if (allBookings.length > 0) {
      console.log('Sample booking:', allBookings[0]);
      console.log('Available categories:', [...new Set(allBookings.map(b => b.category))]);
    }

    // Check active and available bookings
    console.log('\n📊 Checking active and available bookings:');
    const { data: activeBookings, error: activeError } = await supabase
      .from('bookings')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'available');

    if (activeError) {
      console.error('❌ Error fetching active bookings:', activeError);
      return;
    }

    console.log(`Active and available bookings: ${activeBookings.length}`);

    // Test the exact query we're using in the component
    console.log('\n🎯 Testing exact component query for each category:');
    
    const categories = ['musicians', 'djs', 'dancers', 'comedians', 'mcs', 'bands'];
    
    for (const category of categories) {
      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('status', 'available')
        .eq('category', category);

      if (error) {
        console.error(`❌ Error for ${category}:`, error);
      } else {
        console.log(`${category}: ${count || 0}`);
      }
    }

    // Let's also check what the actual column names are
    console.log('\n🔍 Checking table structure:');
    if (allBookings.length > 0) {
      const sample = allBookings[0];
      console.log('Sample booking keys:', Object.keys(sample));
      
      // Check if is_active exists
      if ('is_active' in sample) {
        console.log('✅ is_active column exists');
      } else {
        console.log('❌ is_active column does not exist');
      }
      
      // Check if status exists
      if ('status' in sample) {
        console.log('✅ status column exists');
      } else {
        console.log('❌ status column does not exist');
      }
      
      // Check if category exists
      if ('category' in sample) {
        console.log('✅ category column exists');
      } else {
        console.log('❌ category column does not exist');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testCategoryCounts(); 