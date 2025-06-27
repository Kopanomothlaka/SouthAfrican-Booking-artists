# Admin Setup Instructions

## Step 1: Get Your Supabase Service Role Key

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `spgommqxdrvpizlnlidm`
3. Go to **Settings** → **API**
4. Copy the **Service Role Key** (this is different from the anon key)

## Step 2: Create Admin User

1. Open your terminal in the project directory
2. Run the admin creation script:
   ```bash
   node create-admin.js
   ```
3. When prompted, paste your Service Role Key
4. The script will create an admin user with these default credentials:
   - **Email:** admin@booksa.com
   - **Password:** admin123456

## Step 3: Access Admin Dashboard

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Go to: http://localhost:8080/admin-login
3. Login with the admin credentials created in Step 2
4. You'll be redirected to the admin dashboard at: http://localhost:8080/admin

## Step 4: Security (Important!)

⚠️ **Change the default password immediately after first login!**

The default credentials are:
- Email: admin@booksa.com
- Password: admin123456

## Admin Dashboard Features

Once logged in, you can:
- View all artist applications
- Approve or reject artist registrations
- Download ID documents
- See application statistics

## Troubleshooting

If you get an error about the service role key:
- Make sure you're using the **Service Role Key**, not the **Anon Key**
- The Service Role Key starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

If login fails:
- Check that the admin user was created successfully
- Verify you're using the correct email and password
- Make sure the user has the `admin` role in their metadata 