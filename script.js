document.addEventListener('DOMContentLoaded', function() {
    const washForm = document.getElementById('washForm');
    const navbar = document.querySelector('.navbar');

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Form submission
    if (washForm) {
        washForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(washForm);
            const service = formData.get('service');
            const vehicle = formData.get('vehicle');
            const datetime = formData.get('datetime');
            const phone = formData.get('phone');
            const email = formData.get('email');

            if (!service || !vehicle || !datetime || !phone || !email) {
                showError('Please fill in all fields');
                return;
            }

            const bookingId = 'CW-' + Math.random().toString(36).substr(2, 8).toUpperCase();
            const ticket = {
                id: bookingId, service, vehicle, datetime, phone, email,
                status: 'pending_payment',
                created: new Date().toISOString()
            };

            saveTicket(ticket);
            showPaymentScreen(ticket);
        });
    }

    function saveTicket(ticket) {
        const tickets = JSON.parse(localStorage.getItem('carwash_tickets') || '[]');
        tickets.push(ticket);
        localStorage.setItem('carwash_tickets', JSON.stringify(tickets));
    }

    function showPaymentScreen(ticket) {
        document.getElementById('ticket-id').textContent = 'Ticket ID: ' + ticket.id;
        document.getElementById('payment-details').innerHTML = `
            <p><strong>Service:</strong> ${ticket.service}</p>
            <p><strong>Vehicle:</strong> ${ticket.vehicle}</p>
            <p><strong>Date & Time:</strong> ${formatDateTime(ticket.datetime)}</p>
            <p><strong>Contact:</strong> ${ticket.phone}</p>
        `;
        document.getElementById('payment-amount').textContent = '₹' + getPrice(ticket.service);
        document.getElementById('payment-status-msg').style.display = 'none';
        document.getElementById('payment-screen').classList.add('active');
    }

    function formatDateTime(datetime) {
        const date = new Date(datetime);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric' });
    }

    function getPrice(service) {
        const prices = { 'basic': 299, 'premium': 799, 'deluxe': 1499 };
        return prices[service] || 0;
    }

    window.checkPaymentStatus = function() {
        const msg = document.getElementById('payment-status-msg');
        msg.style.display = 'block';
        msg.className = 'payment-status-msg';
        msg.textContent = 'Checking payment status...';

        setTimeout(() => {
            msg.className = 'payment-status-msg success';
            msg.innerHTML = '<i class="fas fa-check-circle"></i> Payment Received - Booking Confirmed!';
            setTimeout(() => { closePayment(); location.reload(); }, 2000);
        }, 1500);
    };

    window.closePayment = function() {
        document.getElementById('payment-screen').classList.remove('active');
    };

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444;
            padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;
            font-size: 0.9rem; backdrop-filter: blur(10px);
        `;
        errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
        washForm.insertBefore(errorDiv, washForm.querySelector('button'));
        setTimeout(() => errorDiv.remove(), 3000);
    }
});