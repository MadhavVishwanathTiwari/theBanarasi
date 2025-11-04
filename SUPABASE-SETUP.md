# Supabase Authentication & Booking Setup Guide

This guide will help you set up Supabase authentication with phone OTP and a booking system for the Banarasi website.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Access to your project files
- A phone number for testing

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - **Project Name**: `banarasi-bookings` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users (e.g., Mumbai for India)
5. Click "Create new project" and wait for it to initialize (takes ~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following credentials:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

3. Open `assets/js/auth.js` in your code editor
4. Replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'; // Replace with your Project URL
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your anon key
```

## Step 3: Enable Phone Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Phone** in the list
3. Toggle it **ON**
4. Configure phone provider:

### Option A: Twilio (Recommended for Production)
- Sign up for [Twilio](https://www.twilio.com/)
- Get your Account SID and Auth Token
- Buy a phone number with SMS capabilities
- Enter credentials in Supabase

### Option B: Testing Mode (Development Only)
- For testing, you can enable "Phone OTP via Email"
- Or use Supabase's test phone numbers
- **Note**: This won't send real SMS

5. Set OTP expiry time: **60 seconds** (recommended)
6. Click **Save**

## Step 4: Create Bookings Database Table

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Paste the following SQL:

```sql
-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  venue TEXT NOT NULL CHECK (venue IN ('banquet', 'corporate', 'restaurant')),
  time TEXT NOT NULL CHECK (time IN ('morning', 'afternoon', 'evening', 'night', 'fullday')),
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  event_type TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own bookings
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bookings (for cancellations)
CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for admin dashboard (optional)
CREATE VIEW booking_summary AS
SELECT 
  id,
  phone,
  date,
  venue,
  time,
  guest_count,
  event_type,
  status,
  created_at
FROM bookings
ORDER BY date DESC;
```

4. Click **RUN** to execute the SQL
5. Verify the table was created: Go to **Table Editor** and you should see `bookings` table

## Step 5: Configure Phone Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://yourdomain.com` (or your Vercel URL)
3. Add **Redirect URLs**:
   - `https://yourdomain.com`
   - `http://localhost:3000` (for local testing)

## Step 6: Test the System

### Testing Phone OTP

1. Open your website
2. Click "Login" button in the header
3. Enter your phone number (without country code)
4. Click "Send OTP"
5. Check your phone for the OTP SMS
6. Enter the 6-digit code
7. You should be logged in!

### Testing Booking

1. After logging in, click "My Bookings" in the profile dropdown
2. Select a date on the calendar
3. Fill in the booking details
4. Click "Confirm Booking"
5. Check Supabase **Table Editor** → `bookings` to see your booking

## Step 7: View Bookings (Admin)

To view all bookings as an admin:

1. Go to Supabase **Table Editor** → `bookings`
2. You'll see all bookings with details
3. You can filter by date, status, venue, etc.
4. To contact users, use the `phone` column

### Optional: Create Admin Dashboard

If you want a custom admin dashboard:

1. Create a new page `admin.html`
2. Add authentication check for admin users
3. Fetch bookings using:

```javascript
const { data, error } = await supabaseClient
  .from('bookings')
  .select('*')
  .order('date', { ascending: true });
```

## Troubleshooting

### "Failed to send OTP"
- Check that Phone auth is enabled in Supabase
- Verify Twilio credentials are correct
- Check your Twilio account balance

### "Invalid OTP"
- OTP expires after 60 seconds - request a new one
- Make sure you're entering all 6 digits
- Check for typos

### "Booking system not configured"
- Make sure you ran the SQL script in Step 4
- Check that the `bookings` table exists in Table Editor
- Verify RLS policies are enabled

### "User not logged in"
- Session expires after 1 hour by default
- User needs to login again
- Check browser console for auth errors

## Security Best Practices

1. **Never commit your Supabase keys to Git**
   - Add `assets/js/auth.js` to `.gitignore` if it contains keys
   - Or use environment variables

2. **Enable Row Level Security (RLS)**
   - Already configured in the SQL script
   - Users can only see their own bookings

3. **Rate Limiting**
   - Supabase automatically rate-limits OTP sends
   - Prevents spam and abuse

4. **Validate Input**
   - All form inputs are validated client-side
   - Database has CHECK constraints for data integrity

## Production Checklist

Before going live:

- [ ] Set up Twilio with real phone numbers
- [ ] Configure proper site URL and redirect URLs
- [ ] Test authentication flow end-to-end
- [ ] Test booking creation and viewing
- [ ] Set up email notifications for new bookings (optional)
- [ ] Create admin dashboard for managing bookings
- [ ] Add booking confirmation emails/SMS
- [ ] Test on mobile devices
- [ ] Set up backup and monitoring

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Twilio Docs**: https://www.twilio.com/docs
- **Questions**: Check Supabase Discord or StackOverflow

## Next Steps

Once the basic system is working:

1. Add email notifications when bookings are created
2. Create an admin panel to confirm/reject bookings
3. Add payment integration (Razorpay for India)
4. Send SMS confirmations to users
5. Add booking modification/cancellation features
6. Implement booking availability checks (prevent double-booking)

---

**Need Help?** Feel free to reach out with any questions!

