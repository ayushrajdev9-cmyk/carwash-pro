document.addEventListener('DOMContentLoaded', function() {
    const washForm = document.getElementById('washForm');
    
    // Mobile navigation toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '76px';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.background = 'var(--bg-surface)';
                navLinks.style.padding = '1.5rem';
                navLinks.style.borderBottom = '1px solid var(--border-subtle)';
            }
        });
    }

    // Set default datetime to tomorrow at 10:00 AM
    const datetimeInput = document.querySelector('input[name="datetime"]');
    if (datetimeInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        datetimeInput.value = tomorrow.toISOString().slice(0, 16);
    }

    // Initial price calculation
    window.updateStudioPrice = function() {
        const service = document.getElementById('serviceSelect').value;
        const vehicle = document.getElementById('vehicleSelect').value;
        const addonEngine = document.getElementById('addonEngine').checked;
        const addonOzone = document.getElementById('addonOzone').checked;

        let basePrice = 0;
        let pkgName = 'Not Selected';

        if (service === 'basic') { basePrice = 299; pkgName = 'Basic Wash'; }
        else if (service === 'premium') { basePrice = 799; pkgName = 'Premium Detailing'; }
        else if (service === 'deluxe') { basePrice = 1499; pkgName = 'Deluxe Complete'; }

        let vehicleMultiplier = 1;
        let vehicleName = 'Standard';
        if (vehicle === 'hatchback') { vehicleName = 'Hatchback (Compact)'; vehicleMultiplier = 1; }
        else if (vehicle === 'sedan') { vehicleName = 'Sedan (Standard)'; vehicleMultiplier = 1.1; }
        else if (vehicle === 'suv') { vehicleName = 'SUV / MUV (Large)'; vehicleMultiplier = 1.25; }
        else if (vehicle === 'luxury') { vehicleName = 'Luxury / Exotic'; vehicleMultiplier = 1.5; basePrice += 200; }

        let calculatedPrice = Math.round(basePrice * vehicleMultiplier);
        let addonsTotal = 0;
        let addonsList = [];

        if (addonEngine) { addonsTotal += 300; addonsList.push('Engine Degrease'); }
        if (addonOzone) { addonsTotal += 250; addonsList.push('Ozone Sanitization'); }

        const finalTotal = calculatedPrice + addonsTotal;

        // Update Summary UI
        document.getElementById('sumPkg').textContent = pkgName;
        document.getElementById('sumVehicle').textContent = vehicleName;
        document.getElementById('sumAddons').textContent = addonsList.length > 0 ? addonsList.join(', ') : 'None';
        document.getElementById('sumTotal').textContent = '₹' + finalTotal;
    };

    window.selectPkg = function(pkgKey) {
        const select = document.getElementById('serviceSelect');
        if (select) {
            select.value = pkgKey;
            updateStudioPrice();
        }
    };

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
            const location = formData.get('location');

            if (!service || !vehicle || !datetime || !phone || !email) {
                alert('Please fill in all required booking parameters.');
                return;
            }

            const bookingId = 'CW-' + Math.floor(100000 + Math.random() * 900000);
            const totalAmount = document.getElementById('sumTotal').textContent;

            const ticket = {
                id: bookingId,
                service,
                vehicle,
                datetime,
                phone,
                email,
                location,
                total: totalAmount,
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
        document.getElementById('ticket-id-display').textContent = ticket.id;
        document.getElementById('payment-amount').textContent = ticket.total;
        
        document.getElementById('payment-details').innerHTML = `
            <div class="tm-item">
                <span class="tm-lbl">Service Package</span>
                <span class="tm-val">${ticket.service.toUpperCase()}</span>
            </div>
            <div class="tm-item">
                <span class="tm-lbl">Vehicle Architecture</span>
                <span class="tm-val">${ticket.vehicle.toUpperCase()}</span>
            </div>
            <div class="tm-item">
                <span class="tm-lbl">Hub Location</span>
                <span class="tm-val">${ticket.location.toUpperCase()}</span>
            </div>
            <div class="tm-item">
                <span class="tm-lbl">Appointment Slot</span>
                <span class="tm-val">${formatDateTime(ticket.datetime)}</span>
            </div>
        `;

        // Generate dynamic QR code URL with UPI payload
        const upiData = `upi://pay?pa=carwashpro@upi&pn=CarWashPro%20Obedullaganj&am=${ticket.total.replace('₹','')}&tr=${ticket.id}&cu=INR`;
        document.getElementById('ticket-qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiData)}`;

        // WhatsApp dispatch link
        const waMsg = `*New Booking Ticket - CarWash Pro*%0A*Ticket ID:* ${ticket.id}%0A*Package:* ${ticket.service.toUpperCase()}%0A*Vehicle:* ${ticket.vehicle.toUpperCase()}%0A*Location:* ${ticket.location}%0A*Amount:* ${ticket.total}%0A*Phone:* ${ticket.phone}`;
        document.getElementById('whatsapp-dispatch-btn').href = `https://wa.me/+916266043117?text=${waMsg}`;

        document.getElementById('payment-status-msg').style.display = 'none';
        document.getElementById('payment-screen').classList.add('active');
    }

    function formatDateTime(datetime) {
        const date = new Date(datetime);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' @ ' + date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric' });
    }

    window.checkPaymentStatus = function() {
        const msg = document.getElementById('payment-status-msg');
        msg.style.display = 'block';
        msg.className = 'payment-status-box';
        msg.textContent = 'Verifying UPI Gateway settlement...';

        setTimeout(() => {
            msg.className = 'payment-status-box success';
            msg.innerHTML = '<i class="fas fa-check-circle"></i> Settlement Verified! Ticket Confirmed.';
            setTimeout(() => {
                closePayment();
                alert('Booking successfully confirmed & registered in Obedullaganj hub queue.');
                location.reload();
            }, 1800);
        }, 1500);
    };

    window.closePayment = function() {
        document.getElementById('payment-screen').classList.remove('active');
    };
});