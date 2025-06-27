const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBooking() {
  console.log('🧪 Testing Booking Functionality...\n');

  try {
    // Test 1: Check if booking columns exist
    console.log('1. Checking booking table structure...');
    const { data: bookingColumns, error: columnError } = await supabase
      .from('bookings')
      .select('booking_date, booking_time, experience, booking_type, client_id')
      .limit(1);
    
    if (columnError) {
      console.log('❌ Booking columns error:', columnError.message);
      console.log('   Run the fix-booking-columns.sql script first');
      return;
    } else {
      console.log('✅ Booking columns exist');
    }

    // Test 2: Check if we can find available artist services
    console.log('\n2. Checking for available artist services...');
    const { data: services, error: servicesError } = await supabase
      .from('bookings')
      .select(`
        id,
        title,
        booking_fee,
        artist_id,
        artists!inner(
          full_name,
          email,
          phone
        )
      `)
      .eq('booking_type', 'service')
      .eq('status', 'available')
      .eq('is_active', true)
      .limit(1);

    if (servicesError) {
      console.log('❌ Services query error:', servicesError.message);
    } else if (services && services.length > 0) {
      console.log('✅ Found available artist service');
      console.log('   Service:', {
        id: services[0].id,
        title: services[0].title,
        artist: services[0].artists.full_name,
        fee: services[0].booking_fee
      });
    } else {
      console.log('⚠️  No available artist services found');
      console.log('   You need to have artists create services first');
    }

    // Test 3: Check if we can create a test booking (if we have a service)
    if (services && services.length > 0) {
      console.log('\n3. Testing booking creation...');
      
      // First, create a test client user
      const testEmail = `test-client-${Date.now()}@example.com`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Test Client',
            role: 'client'
          }
        }
      });

      if (authError) {
        console.log('❌ Test client creation failed:', authError.message);
      } else {
        console.log('✅ Test client created');
        
        // Wait for user profile to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to create a booking
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .insert({
            artist_id: services[0].artist_id,
            client_id: authData.user.id,
            booking_date: '2024-12-25',
            booking_time: '14:00',
            experience: 'Test booking experience',
            booking_fee: services[0].booking_fee,
            status: 'pending',
            booking_type: 'booking',
            client_name: 'Test Client',
            client_email: testEmail,
            title: `Booking with ${services[0].artists.full_name}`,
            description: 'Test booking experience',
            category: 'booking',
            currency: 'ZAR',
            is_active: true
          })
          .select();

        if (bookingError) {
          console.log('❌ Booking creation failed:', bookingError.message);
        } else {
          console.log('✅ Test booking created successfully');
          console.log('   Booking ID:', bookingData[0].id);
          
          // Clean up test booking
          await supabase.from('bookings').delete().eq('id', bookingData[0].id);
          console.log('   Test booking cleaned up');
        }

        // Clean up test client
        await supabase.from('users').delete().eq('id', authData.user.id);
        console.log('   Test client cleaned up');
      }
    }

    console.log('\n🎉 Booking test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure artists have created services (booking_type = "service")');
    console.log('2. Test client registration and login');
    console.log('3. Test the booking flow in the UI');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBooking(); 