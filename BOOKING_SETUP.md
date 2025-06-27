# Artist Booking System Setup Guide

This guide will help you set up the artist booking functionality that allows artists to create and manage their booking offers with pictures, experience details, availability, and booking fees.

## 🗄️ Database Setup

### Step 1: Run the SQL Script

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `booking-setup-simple.sql` into the editor
4. Click "Run" to execute the script

This will create:
- `bookings` table - stores all booking information
- `booking_images` table - stores multiple images per booking
- `booking-images` storage bucket - for storing booking images
- Row Level Security (RLS) policies for data protection

### Step 2: Verify Setup

Run the test script to verify everything is working:

```bash
node test-booking.cjs
```

This will test:
- Artist authentication
- Booking creation
- Booking retrieval
- Booking updates
- Booking deletion

## 🎨 Features Overview

### For Artists

#### Create Bookings
- **Title & Description**: Clear service description
- **Category**: Musician, DJ, Dancer, Comedian, MC, Band
- **Pricing**: Set booking fee in ZAR
- **Experience**: Years of experience and detailed description
- **Availability**: Date ranges and availability notes
- **Location**: Service area
- **Duration**: Minimum and maximum booking hours
- **Contact Info**: Email and phone for client inquiries
- **Images**: Upload multiple images (up to 5MB each)

#### Manage Bookings
- View all your bookings in a grid layout
- See booking status (available, booked, cancelled, completed)
- Activate/deactivate bookings
- Delete bookings
- View detailed booking information
- Manage booking images

### For Clients (Future Feature)
- Browse available bookings
- Filter by category, location, price
- View artist details and booking information
- Contact artists directly

## 🚀 How to Use

### 1. Artist Login
1. Navigate to `/artist-login`
2. Log in with your approved artist account
3. You'll be redirected to the Artist Dashboard

### 2. Create a New Booking
1. In the Artist Dashboard, click "Create New Booking"
2. Fill out the comprehensive booking form:
   - **Basic Info**: Title, category, description
   - **Pricing**: Set your booking fee
   - **Experience**: Years and description
   - **Availability**: Date ranges and notes
   - **Location**: Where you provide services
   - **Duration**: Min/max hours
   - **Contact**: Email and phone
   - **Images**: Upload photos of your work
3. Click "Create Booking"

### 3. Manage Your Bookings
1. Click "Manage Bookings" in the dashboard
2. View all your bookings in a card layout
3. Use the action buttons to:
   - **View**: See detailed booking information
   - **Activate/Deactivate**: Control booking visibility
   - **Delete**: Remove bookings permanently

## 📊 Database Schema

### Bookings Table
```sql
bookings (
  id uuid PRIMARY KEY,
  artist_id uuid REFERENCES artists(id),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  booking_fee decimal(10,2) NOT NULL,
  currency text DEFAULT 'ZAR',
  experience_years integer,
  experience_description text,
  availability_start date,
  availability_end date,
  availability_notes text,
  location text,
  max_duration_hours integer,
  min_duration_hours integer DEFAULT 1,
  is_active boolean DEFAULT true,
  status text DEFAULT 'available',
  contact_email text,
  contact_phone text,
  created_at timestamp
)
```

### Booking Images Table
```sql
booking_images (
  id uuid PRIMARY KEY,
  booking_id uuid REFERENCES bookings(id),
  image_url text NOT NULL,
  image_name text,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp
)
```

## 🔒 Security Features

### Row Level Security (RLS)
- Artists can only manage their own bookings
- Public can view only active and available bookings
- Images are protected and only accessible to authorized users

### Storage Security
- Images are stored in a dedicated `booking-images` bucket
- Access controlled through RLS policies
- File size limits (5MB per image)
- Supported formats: JPG, PNG, WebP

## 🎯 Best Practices

### For Artists
1. **Clear Descriptions**: Write detailed, professional descriptions
2. **Quality Images**: Upload high-quality photos of your work
3. **Accurate Pricing**: Set competitive but fair pricing
4. **Realistic Availability**: Keep availability dates current
5. **Professional Contact**: Use professional email and phone

### For Developers
1. **Error Handling**: All components include proper error handling
2. **Loading States**: Users see loading indicators during operations
3. **Validation**: Form validation prevents invalid data
4. **Responsive Design**: Works on all device sizes
5. **Accessibility**: Follows accessibility best practices

## 🐛 Troubleshooting

### Common Issues

#### "Table 'bookings' doesn't exist"
- Run the `booking-setup-simple.sql` script in Supabase SQL Editor

#### "Permission denied" errors
- Check that RLS policies are properly set up
- Verify user authentication status

#### Image upload fails
- Check file size (must be under 5MB)
- Verify file format (JPG, PNG, WebP only)
- Ensure storage bucket exists

#### Infinite recursion errors
- Use the simplified SQL script (`booking-setup-simple.sql`)
- Avoid complex RLS policies that reference the same table

### Testing
Run the test script to verify functionality:
```bash
node test-booking.cjs
```

## 🔄 Future Enhancements

### Planned Features
- Client booking requests
- Booking calendar integration
- Payment processing
- Review and rating system
- Advanced search and filtering
- Booking analytics and reporting
- Mobile app support

### API Endpoints
- `GET /api/bookings` - List available bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `POST /api/bookings/:id/images` - Upload booking images

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Run the test script to verify setup
3. Check Supabase logs for detailed error messages
4. Verify all environment variables are set correctly

---

**Happy Booking! 🎉** 