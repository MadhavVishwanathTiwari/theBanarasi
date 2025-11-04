// ===================================
// Supabase Authentication with Phone OTP
// ===================================

// IMPORTANT: Replace these with your Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State management
let currentPhone = '';
let resendTimerInterval = null;

// DOM Elements
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const authClose = document.getElementById('authClose');
const phoneStep = document.getElementById('phoneStep');
const otpStep = document.getElementById('otpStep');
const authLoading = document.getElementById('authLoading');
const phoneForm = document.getElementById('phoneForm');
const otpForm = document.getElementById('otpForm');
const phoneNumber = document.getElementById('phoneNumber');
const displayPhone = document.getElementById('displayPhone');
const changeNumber = document.getElementById('changeNumber');
const resendOtp = document.getElementById('resendOtp');
const resendTimer = document.getElementById('resendTimer');
const otpInputs = document.querySelectorAll('.otp-input');
const userProfile = document.getElementById('userProfile');
const userName = document.getElementById('userName');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is already logged in
checkAuthState();

async function checkAuthState() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        // User is logged in
        showUserProfile(session.user);
    } else {
        // User is not logged in
        showLoginButton();
    }
}

function showUserProfile(user) {
    // Hide login button
    loginBtn.style.display = 'none';
    
    // Show user profile
    userProfile.style.display = 'flex';
    
    // Set user name (phone number without country code)
    const phone = user.phone || user.user_metadata?.phone || 'User';
    userName.textContent = phone.replace('+91', '');
}

function showLoginButton() {
    loginBtn.style.display = 'block';
    userProfile.style.display = 'none';
}

// Open auth modal
loginBtn.addEventListener('click', () => {
    authModal.classList.add('show');
    resetAuthModal();
});

// Close auth modal
authClose.addEventListener('click', () => {
    authModal.classList.remove('show');
});

// Close modal on outside click
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.remove('show');
    }
});

// Handle phone form submission
phoneForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = phoneNumber.value.trim();
    
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    currentPhone = `+91${phone}`;
    await sendOTP(currentPhone);
});

// Send OTP
async function sendOTP(phone) {
    showLoading();
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithOtp({
            phone: phone,
        });
        
        if (error) throw error;
        
        // Show OTP step
        showOTPStep(phone);
        startResendTimer();
        
    } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Failed to send OTP. Please try again.');
        hideLoading();
    }
}

// Show OTP step
function showOTPStep(phone) {
    phoneStep.style.display = 'none';
    authLoading.style.display = 'none';
    otpStep.style.display = 'block';
    displayPhone.textContent = phone;
    otpInputs[0].focus();
}

// Handle OTP input auto-advance
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            e.target.value = '';
            return;
        }
        
        // Move to next input
        if (value && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });
    
    // Handle backspace
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            otpInputs[index - 1].focus();
        }
    });
    
    // Paste handling
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        
        if (!/^\d+$/.test(pastedData)) return;
        
        pastedData.split('').forEach((char, i) => {
            if (otpInputs[i]) {
                otpInputs[i].value = char;
            }
        });
        
        // Focus last filled input
        const lastFilledIndex = Math.min(pastedData.length - 1, 5);
        otpInputs[lastFilledIndex].focus();
    });
});

// Handle OTP form submission
otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    
    if (otp.length !== 6) {
        alert('Please enter the complete 6-digit OTP');
        return;
    }
    
    await verifyOTP(currentPhone, otp);
});

// Verify OTP
async function verifyOTP(phone, token) {
    showLoading();
    
    try {
        const { data, error } = await supabaseClient.auth.verifyOtp({
            phone: phone,
            token: token,
            type: 'sms'
        });
        
        if (error) throw error;
        
        // Success! User is now logged in
        console.log('User logged in:', data.user);
        
        // Close modal
        authModal.classList.remove('show');
        
        // Show user profile
        showUserProfile(data.user);
        
        // Show success message
        alert('Login successful! You can now book events.');
        
    } catch (error) {
        console.error('Error verifying OTP:', error);
        alert('Invalid OTP. Please try again.');
        hideLoading();
        
        // Clear OTP inputs
        otpInputs.forEach(input => input.value = '');
        otpInputs[0].focus();
    }
}

// Change number button
changeNumber.addEventListener('click', () => {
    resetAuthModal();
});

// Resend OTP
resendOtp.addEventListener('click', async () => {
    if (resendOtp.disabled) return;
    
    await sendOTP(currentPhone);
});

// Start resend timer
function startResendTimer() {
    let seconds = 30;
    resendOtp.disabled = true;
    resendTimer.textContent = seconds;
    
    if (resendTimerInterval) clearInterval(resendTimerInterval);
    
    resendTimerInterval = setInterval(() => {
        seconds--;
        resendTimer.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(resendTimerInterval);
            resendOtp.disabled = false;
            resendOtp.innerHTML = 'Resend OTP';
        }
    }, 1000);
}

// Profile dropdown toggle
profileBtn.addEventListener('click', () => {
    profileDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!userProfile.contains(e.target)) {
        profileDropdown.classList.remove('show');
    }
});

// Logout
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
        console.error('Error logging out:', error);
        alert('Failed to logout');
        return;
    }
    
    // Update UI
    showLoginButton();
    profileDropdown.classList.remove('show');
    alert('Logged out successfully');
});

// Helper functions
function showLoading() {
    phoneStep.style.display = 'none';
    otpStep.style.display = 'none';
    authLoading.style.display = 'block';
}

function hideLoading() {
    authLoading.style.display = 'none';
    phoneStep.style.display = 'block';
}

function resetAuthModal() {
    phoneStep.style.display = 'block';
    otpStep.style.display = 'none';
    authLoading.style.display = 'none';
    phoneNumber.value = '';
    otpInputs.forEach(input => input.value = '');
    currentPhone = '';
    
    if (resendTimerInterval) {
        clearInterval(resendTimerInterval);
    }
}

// Listen for auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN') {
        showUserProfile(session.user);
    } else if (event === 'SIGNED_OUT') {
        showLoginButton();
    }
});

// Export for use in other files
window.supabaseClient = supabaseClient;
window.checkAuthState = checkAuthState;

