// ===================================
// Booking Calendar System
// ===================================

// DOM Elements
const bookingModal = document.getElementById('bookingModal');
const bookingClose = document.getElementById('bookingClose');
const myBookingsLink = document.getElementById('myBookingsLink');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthDisplay = document.getElementById('currentMonth');
const calendarDaysContainer = document.getElementById('calendarDays');
const bookingDetails = document.getElementById('bookingDetails');
const bookingForm = document.getElementById('bookingForm');
const backToCalendarBtn = document.getElementById('backToCalendar');

// State
let currentDate = new Date();
let selectedDate = null;
let bookings = [];

// Initialize
loadBookings();

// Open booking modal (from "My Bookings" link)
myBookingsLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    if (!session) {
        alert('Please login first to book events');
        document.getElementById('loginBtn').click();
        return;
    }
    
    // Open booking modal
    bookingModal.classList.add('show');
    renderCalendar();
});

// Also open booking modal when clicking "Book Event" button if logged in
const bookEventBtns = document.querySelectorAll('.btn-nav');
bookEventBtns.forEach(btn => {
    if (btn.textContent.includes('Book') && btn.tagName === 'A') {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Check if user is logged in
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            
            if (!session) {
                alert('Please login first to book events');
                document.getElementById('loginBtn').click();
                return;
            }
            
            // Open booking modal
            bookingModal.classList.add('show');
            renderCalendar();
        });
    }
});

// Close booking modal
bookingClose.addEventListener('click', () => {
    bookingModal.classList.remove('show');
    resetBookingModal();
});

// Close modal on outside click
bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        bookingModal.classList.remove('show');
        resetBookingModal();
    }
});

// Calendar navigation
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Clear calendar
    calendarDaysContainer.innerHTML = '';
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day disabled';
        calendarDaysContainer.appendChild(emptyDay);
    }
    
    // Add days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const cellDate = new Date(year, month, day);
        cellDate.setHours(0, 0, 0, 0);
        
        // Mark past dates
        if (cellDate < today) {
            dayElement.classList.add('past');
        }
        
        // Mark today
        if (cellDate.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }
        
        // Check if date is booked
        const isBooked = bookings.some(booking => {
            const bookingDate = new Date(booking.date);
            bookingDate.setHours(0, 0, 0, 0);
            return bookingDate.getTime() === cellDate.getTime();
        });
        
        if (isBooked) {
            dayElement.classList.add('booked');
        }
        
        // Mark selected date
        if (selectedDate && cellDate.getTime() === selectedDate.getTime()) {
            dayElement.classList.add('selected');
        }
        
        // Add click handler
        if (cellDate >= today) {
            dayElement.addEventListener('click', () => selectDate(cellDate, dayElement));
        }
        
        calendarDaysContainer.appendChild(dayElement);
    }
}

// Select date
function selectDate(date, element) {
    selectedDate = date;
    
    // Remove previous selection
    document.querySelectorAll('.calendar-day').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Mark selected
    element.classList.add('selected');
    
    // Show booking form
    showBookingForm();
}

// Show booking form
function showBookingForm() {
    document.querySelector('.booking-calendar').style.display = 'none';
    bookingDetails.style.display = 'block';
}

// Back to calendar
backToCalendarBtn.addEventListener('click', () => {
    document.querySelector('.booking-calendar').style.display = 'block';
    bookingDetails.style.display = 'none';
});

// Handle booking form submission
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    if (!session) {
        alert('Please login to continue');
        return;
    }
    
    // Get form data
    const bookingData = {
        user_id: session.user.id,
        phone: session.user.phone,
        date: selectedDate.toISOString().split('T')[0],
        venue: document.getElementById('bookingVenue').value,
        time: document.getElementById('bookingTime').value,
        guest_count: parseInt(document.getElementById('guestCount').value),
        event_type: document.getElementById('eventType').value,
        notes: document.getElementById('bookingNotes').value,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    // Save booking
    await saveBooking(bookingData);
});

// Save booking to Supabase
async function saveBooking(bookingData) {
    try {
        // Insert booking into database
        const { data, error } = await window.supabaseClient
            .from('bookings')
            .insert([bookingData])
            .select();
        
        if (error) throw error;
        
        // Add to local bookings array
        bookings.push(data[0]);
        
        // Show success message
        alert('Booking request submitted successfully! We will contact you shortly to confirm your booking.');
        
        // Close modal
        bookingModal.classList.remove('show');
        resetBookingModal();
        
    } catch (error) {
        console.error('Error saving booking:', error);
        
        // If table doesn't exist, show instructions
        if (error.message?.includes('relation "bookings" does not exist')) {
            alert('Booking system is not yet configured. Please see SUPABASE-SETUP.md for instructions.');
        } else {
            alert('Failed to submit booking. Please try again or contact us directly.');
        }
    }
}

// Load bookings from Supabase
async function loadBookings() {
    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (!session) return;
        
        // Fetch user's bookings
        const { data, error } = await window.supabaseClient
            .from('bookings')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: true });
        
        if (error) {
            console.error('Error loading bookings:', error);
            return;
        }
        
        bookings = data || [];
        
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Reset booking modal
function resetBookingModal() {
    selectedDate = null;
    bookingForm.reset();
    document.querySelector('.booking-calendar').style.display = 'block';
    bookingDetails.style.display = 'none';
    currentDate = new Date();
    renderCalendar();
}

// Reload bookings when user logs in
if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            loadBookings();
        }
    });
}

