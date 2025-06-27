const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ29tbXF4ZHJ2cGl6bG5saWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAyODQsImV4cCI6MjA2NjAyNjI4NH0.eTLL0v9tR8gfpABablkEtBDm6yr4H_EyvjMYlGIQ3T0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBookings() {
  console.log('🔍 Testing Bookings Database');
  console.log('============================');

  try {
    // 1. Check if bookings table exists and has data
    console.log('\n1️⃣ Checking all bookings...');
    const { data: allBookings, error: allError } = await supabase
      .from('bookings')
      .select('*');

    if (allError) {
      console.error('❌ Error fetching all bookings:', allError.message);
      return;
    }

    console.log(`✅ Found ${allBookings.length} total bookings`);
    
    if (allBookings.length > 0) {
      console.log('\n📊 Booking Status Breakdown:');
      const statusCount = {};
      allBookings.forEach(booking => {
        statusCount[booking.status] = (statusCount[booking.status] || 0) + 1;
      });
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} bookings`);
      });

      console.log('\n📋 Sample Bookings:');
      allBookings.slice(0, 3).forEach((booking, index) => {
        console.log(`   ${index + 1}. ID: ${booking.id}`);
        console.log(`      Title: ${booking.title}`);
        console.log(`      Status: ${booking.status}`);
        console.log(`      Active: ${booking.is_active}`);
        console.log(`      Category: ${booking.category}`);
        console.log(`      Fee: R${booking.booking_fee}`);
        console.log('');
      });
    }

    // 2. Check available and active bookings
    console.log('\n2️⃣ Checking available and active bookings...');
    const { data: availableBookings, error: availableError } = await supabase
      .from('bookings')
      .select(`
        *,
        artists!inner(
          id,
          artist_name,
          full_name,
          location
        )
      `)
      .eq('is_active', true)
      .eq('status', 'available');

    if (availableError) {
      console.error('❌ Error fetching available bookings:', availableError.message);
      return;
    }

    console.log(`✅ Found ${availableBookings.length} available and active bookings`);

    if (availableBookings.length > 0) {
      console.log('\n🎯 Available Bookings:');
      availableBookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.title}`);
        console.log(`      Artist: ${booking.artists.artist_name || booking.artists.full_name}`);
        console.log(`      Category: ${booking.category}`);
        console.log(`      Fee: R${booking.booking_fee}`);
        console.log(`      Location: ${booking.location || booking.artists.location}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No available bookings found!');
      console.log('   This could mean:');
      console.log('   - No bookings have been created yet');
      console.log('   - All bookings are inactive (is_active = false)');
      console.log('   - All bookings have status other than "available"');
      console.log('   - No artists are approved yet');
    }

    // 3. Check artists table
    console.log('\n3️⃣ Checking artists...');
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('*');

    if (artistsError) {
      console.error('❌ Error fetching artists:', artistsError.message);
      return;
    }

    console.log(`✅ Found ${artists.length} total artists`);
    
    if (artists.length > 0) {
      const approvedArtists = artists.filter(a => a.status === 'approved');
      console.log(`   Approved artists: ${approvedArtists.length}`);
      
      if (approvedArtists.length > 0) {
        console.log('\n👨‍🎨 Approved Artists:');
        approvedArtists.forEach((artist, index) => {
          console.log(`   ${index + 1}. ${artist.artist_name || artist.full_name}`);
          console.log(`      Category: ${artist.category}`);
          console.log(`      Status: ${artist.status}`);
          console.log('');
        });
      }
    }

    console.log('\n📝 Next steps:');
    if (availableBookings.length === 0) {
      console.log('   1. Create some test bookings using the booking form');
      console.log('   2. Make sure bookings have status = "available"');
      console.log('   3. Make sure bookings have is_active = true');
      console.log('   4. Make sure artists are approved');
    } else {
      console.log('   ✅ Bookings are working correctly!');
      console.log('   🚀 You can now test the ArtistsList component');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testBookings(); 