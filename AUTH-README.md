# Authentication & Booking System

## Overview

The Banarasi website now includes a complete authentication and booking system powered by Supabase. Users can login with their phone numbers (via OTP) and book events through an interactive calendar.

## Features

### 🔐 Phone Authentication (OTP)
- Secure login using phone number
- 6-digit OTP verification
- 30-second resend timer
- Session management
- Auto-logout after session expires

### 📅 Booking Calendar
- Interactive calendar interface
- Select future dates for events
- Multiple venue options:
  - Main Banquet Hall (1200 guests)
  - Corporate Hall (150 guests)
  - Restaurant Party Hall (20-30 guests)
- Time slot selection
- Guest count and event type
- Additional requirements field

### 👤 User Profile
- Profile dropdown in header
- View bookings
- Logout functionality

## User Flow

1. **Login**
   - Click "Login" button in header
   - Enter 10-digit phone number
   - Receive OTP via SMS
   - Enter 6-digit OTP
   - Logged in!

2. **Book Event**
   - Click "My Bookings" in profile dropdown
   - Select date on calendar
   - Choose venue and time
   - Fill in event details
   - Submit booking
   - Receive confirmation

3. **View Bookings**
   - Bookings are stored in Supabase
   - View in admin dashboard
   - Contact customers via phone

## Files Created

### HTML (Updated)
- `index.html` - Added login button, user profile, auth modal, booking modal

### CSS (Updated)
- `assets/css/styles.css` - Added auth and booking styles

### JavaScript
- `assets/js/auth.js` - Supabase authentication with phone OTP
- `assets/js/booking.js` - Booking calendar and form handling

### Documentation
- `SUPABASE-SETUP.md` - Complete setup guide
- `AUTH-README.md` - This file

## Quick Setup

1. **Create Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create new project
   - Wait for initialization

2. **Get Credentials**
   - Settings → API
   - Copy Project URL and anon key

3. **Update Code**
   - Open `assets/js/auth.js`
   - Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY`

4. **Enable Phone Auth**
   - Authentication → Providers → Phone
   - Set up Twilio or use test mode

5. **Create Database**
   - SQL Editor → New query
   - Paste SQL from `SUPABASE-SETUP.md`
   - Run query

6. **Test**
   - Click Login
   - Enter phone number
   - Verify OTP
   - Try booking!

## Configuration

### Supabase Credentials
Edit `assets/js/auth.js`:
```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### Phone Provider
- **Development**: Use Supabase test mode
- **Production**: Set up Twilio for real SMS

### Venue Options
Edit `index.html` booking form to add/remove venues:
```html
<select id="bookingVenue" required>
  <option value="banquet">Main Banquet Hall</option>
  <!-- Add more options -->
</select>
```

## API Endpoints (Supabase)

### Authentication
- `supabase.auth.signInWithOtp({ phone })` - Send OTP
- `supabase.auth.verifyOtp({ phone, token })` - Verify OTP
- `supabase.auth.signOut()` - Logout
- `supabase.auth.getSession()` - Get current session

### Bookings
- `supabase.from('bookings').insert()` - Create booking
- `supabase.from('bookings').select()` - Get bookings
- `supabase.from('bookings').update()` - Update booking

## Database Schema

### `bookings` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to auth.users |
| phone | TEXT | User phone number |
| date | DATE | Booking date |
| venue | TEXT | banquet/corporate/restaurant |
| time | TEXT | morning/afternoon/evening/night/fullday |
| guest_count | INTEGER | Number of guests |
| event_type | TEXT | wedding/birthday/corporate/etc |
| notes | TEXT | Additional requirements |
| status | TEXT | pending/confirmed/cancelled |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

## Security

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only see their own bookings
- ✅ Phone authentication with OTP
- ✅ Session-based access control
- ✅ Input validation and sanitization
- ✅ Rate limiting on OTP sends

## Styling

The auth and booking components use the same design system as the rest of the site:

- **Colors**: Dark brown (`#5C4033`), Medium brown (`#8B6F47`)
- **Fonts**: Cormorant Garamond (headings), Inter (body)
- **Radius**: 8px for buttons and inputs, 16px for modals
- **Shadows**: Subtle shadows for elevation
- **Transitions**: 300ms ease for smooth interactions

## Mobile Responsive

All authentication and booking components are fully responsive:
- Modal sizes adjust for mobile
- Calendar optimized for touch
- OTP inputs sized for mobile keyboards
- Forms stack vertically on small screens

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)
- ⚠️ IE11 not supported (uses modern JavaScript)

## Troubleshooting

### OTP not received
1. Check Twilio configuration
2. Verify phone number format (+91xxxxxxxxxx)
3. Check Twilio balance
4. Review Supabase logs

### "Booking system not configured"
1. Make sure you ran the SQL script
2. Check that `bookings` table exists
3. Verify RLS policies are enabled

### Session expired
- Sessions expire after 1 hour by default
- User needs to login again
- Can be configured in Supabase settings

## Future Enhancements

- [ ] Email notifications for new bookings
- [ ] SMS confirmation to users
- [ ] Admin dashboard for managing bookings
- [ ] Payment integration (Razorpay)
- [ ] Booking modification/cancellation
- [ ] Availability checking (prevent double-booking)
- [ ] Calendar view of all bookings
- [ ] Export bookings to CSV/PDF
- [ ] Booking reminders (24h before event)
- [ ] User booking history
- [ ] Rating and review system

## Support

For issues or questions:
1. Check `SUPABASE-SETUP.md` for detailed setup
2. Review Supabase documentation
3. Check browser console for errors
4. Verify Supabase credentials are correct

---

**Ready to launch!** Follow the setup guide and you'll have a fully functional booking system in minutes. 🚀

