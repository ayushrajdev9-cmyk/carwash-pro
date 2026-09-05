document.addEventListener('DOMContentLoaded', function() {
    // Form submission handling
    const washForm = document.getElementById('washForm');
    
    if (washForm) {
        washForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(washForm);
            const service = formData.get('service');
            const vehicle = formData.get('vehicle');
            const datetime = formData.get('datetime');
            const phone = formData.get('phone');
            const email = formData.get('email');
            
            // Validate form
            if (!service || !vehicle || !datetime || !phone || !email) {
                showError('Please fill in all fields');
                return;
            }
            
            // Generate ticket/booking ID
            const bookingId = 'CW-' + Math.random().toString(36).substr(2, 8).toUpperCase();
            
            // Create payment ticket
            const ticket = {
                id: bookingId,
                service: service,
                vehicle: vehicle,
                datetime: datetime,
                phone: phone,
                email: email,
                status: 'pending_payment',
                created: new Date().toISOString()
            };
            
            // Store ticket locally
            saveTicket(ticket);
            
            // Show payment modal
            showPaymentScreen(ticket);
        });
    }
    
    // Save ticket to localStorage
    function saveTicket(ticket) {
        const tickets = JSON.parse(localStorage.getItem('carwash_tickets') || '[]');
        tickets.push(ticket);
        localStorage.setItem('carwash_tickets', JSON.stringify(tickets));
    }
    
    // Show payment screen
    function showPaymentScreen(ticket) {
        // Hide other sections
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Create payment screen HTML
        const paymentScreen = document.createElement('div');
        paymentScreen.id = 'payment-screen';
        paymentScreen.innerHTML = `
            <div class="payment-container">
                <div class="payment-header">
                    <h2>Payment Required</h2>
                    <span class="ticket-id">Ticket ID: ${ticket.id}</span>
                </div>
                <div class="payment-details">
                    <p><strong>Service:</strong> ${ticket.service}</p>
                    <p><strong>Vehicle:</strong> ${ticket.vehicle}</p>
                    <p><strong>Date & Time:</strong> ${formatDateTime(ticket.datetime)}</p>
                    <p><strong>Contact:</strong> ${ticket.phone}</p>
                </div>
                <div class="payment-amount">
                    <span>₹${getPrice(ticket.service)}</span>
                </div>
                <div class="qr-code-section">
                    <h3>Scan QR Code to Pay</h3>
                    <div class="qr-code">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CarWashPro|${ticket.id}|${getPrice(ticket.service)}" alt="QR Code for Payment">
                    </div>
                    <p>Or manually pay using UPI: <code>carwashpro@upi</code></p>
                    <p>After payment, your car will be serviced at the scheduled time.</p>
                </div>
                <div class="payment-status" id="payment-status">
                    <p>Status: Pending Payment</p>
                </div>
                <div class="payment-buttons">
                    <button class="btn btn-primary" onclick="refreshPaymentStatus('${ticket.id}')">Check Payment Status</button>
                    <button class="btn btn-outline" onclick="closePaymentScreen()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(paymentScreen);
    }
    
    // Format date/time
    function formatDateTime(datetime) {
        const date = new Date(datetime);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' at ' + date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric' });
    }
    
    // Get price from service
    function getPrice(service) {
        const prices = {
            'basic': 299,
            'premium': 799,
            'deluxe': 1499
        };
        return prices[service] || 0;
    }
    
    // Refresh payment status
    window.refreshPaymentStatus = function(ticketId) {
        const statusEl = document.getElementById('payment-status');
        statusEl.innerHTML = '<p>Checking payment status...</p>';
        
        // Simulate payment check - in real app, this would call an API
        setTimeout(() => {
            statusEl.innerHTML = '<p style="color: var(--success);">Payment Received - Booking Confirmed!</p>';
            statusEl.innerHTML += '<p>Your car wash service is scheduled.</p>';
            
            // Redirect back after 2 seconds
            setTimeout(() => {
                closePaymentScreen();
                location.reload();
            }, 2000);
        }, 1500);
    };
    
    // Close payment screen
    window.closePaymentScreen = function() {
        const paymentScreen = document.getElementById('payment-screen');
        if (paymentScreen) {
            paymentScreen.remove();
        }
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'block';
        });
    };
    
    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--error);
            color: var(--error);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            text-align: center;
        `;
        washForm.insertBefore(errorDiv, washForm.querySelector('button'));
        
        setTimeout(() => errorDiv.remove(), 3000);
    }
    
    // Initialize tooltips for payment info
    const tooltips = document.querySelectorAll('.payment-info');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        tooltip.addEventListener('mouseleave', function() {
            this.style.opacity = '0.8';
        });
    });
});