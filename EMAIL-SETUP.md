# Contact Form Email Setup Guide

## Using Web3Forms (Free & Easy)

Your contact form is configured to send emails using **Web3Forms** - a free service for static websites.

### Step 1: Get Your Access Key

1. **Visit:** [https://web3forms.com](https://web3forms.com)
2. **Enter your email** where you want to receive form submissions
3. **Click "Get Access Key"**
4. **Copy the access key** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
5. **Verify your email** - check inbox for verification link

### Step 2: Add Access Key to Website

1. Open `index.html`
2. Find line 188:
   ```html
   <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
   ```
3. Replace `YOUR_ACCESS_KEY_HERE` with your actual key:
   ```html
   <input type="hidden" name="access_key" value="a1b2c3d4-e5f6-7890-abcd-ef1234567890">
   ```
4. Save the file

### Step 3: Test the Form

1. Open your website
2. Fill out the contact form
3. Click "Send Message"
4. Check your email inbox
5. You should receive the form submission!

---

## What You'll Receive

**Email format:**
```
From: noreply@web3forms.com
Subject: New Contact Form Submission - Banarasi Restaurant

Name: John Doe
Email: john@example.com
Phone: 123-456-7890
Message: I would like to inquire about banquet booking...
```

---

## Optional Customization

### Change Email Subject

In `index.html` line 194:
```html
<input type="hidden" name="subject" value="New Contact Form Submission - Banarasi Restaurant">
```

### Add Auto-Reply to Customer

Add this hidden field:
```html
<input type="hidden" name="autoresponse" value="Thank you for contacting Banarasi Banquet & Restaurant. We'll get back to you soon!">
```

### Redirect After Submission

Line 191 - create a thank-you page or remove the redirect:
```html
<!-- Option 1: Redirect to thank you page -->
<input type="hidden" name="redirect" value="https://yoursite.com/thank-you.html">

<!-- Option 2: Remove redirect (stays on same page) -->
<!-- Just delete or comment out this line -->
```

---

## Features Already Included

✅ **Spam Protection** - Honeypot field to catch bots  
✅ **Loading States** - Button shows "Sending..."  
✅ **Success Message** - "Message Sent! ✓" with green button  
✅ **Error Handling** - "Error - Try Again" if something fails  
✅ **Form Reset** - Auto-clears after 3 seconds  
✅ **Validation** - All fields required except phone  

---

## Limits (Free Tier)

- **250 submissions/month** - More than enough for most businesses
- **Unlimited emails** to receive at
- **File attachments** not supported in free tier
- **No credit card** required

---

## Alternative: Direct Email (Simpler but Less Reliable)

If you don't want Web3Forms, you can use `mailto:` (opens user's email client):

Replace the entire form tag with:
```html
<form class="contact-form" action="mailto:your@email.com" method="POST" enctype="text/plain">
```

**Cons of mailto:**
- Opens user's email app (Gmail, Outlook)
- Less reliable (requires email client)
- No spam protection
- Poor user experience

**Recommendation:** Stick with Web3Forms!

---

## Need Help?

1. **Web3Forms Documentation:** [https://docs.web3forms.com](https://docs.web3forms.com)
2. **Test the form** before going live
3. **Check spam folder** if emails don't arrive
4. **Whitelist** noreply@web3forms.com in your email

---

## Current Setup Status

- ✅ Form HTML configured
- ✅ JavaScript handles submission
- ✅ UI feedback implemented
- ⏳ **Waiting for:** Your Web3Forms access key

Once you add the access key, the form will be fully functional!

