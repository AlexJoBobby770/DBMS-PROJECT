
let bookings = [];
  
  document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
    populateFormOptions();
  });
  
  async function loadBookings() {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      bookings = await res.json();
    } catch (e) {
      console.error('Error loading bookings', e);
      alert('Failed to load bookings');
      bookings = [];
    }

    const tbody = document.querySelector('#bookingsTable tbody');
    tbody.innerHTML = '';
    bookings.forEach(booking => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${booking.id}</td>
        <td>${booking.guest_name}</td>
        <td>${booking.room_no}</td>
        <td>${booking.checkin}</td>
        <td>${booking.checkout}</td>
        <td>₹${booking.amount}</td>
        <td><span class="status ${booking.status.toLowerCase()}">${booking.status}</span></td>
        <td>
          <button class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-right: 0.5rem;" onclick="editBooking(${booking.id})">Edit</button>
          <button class="btn btn-danger" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;" onclick="cancelBooking(${booking.id})">Cancel</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
  
  function toggleForm() {
    const form = document.getElementById('bookingForm');
    form.classList.toggle('active');
  }
  
  async function addBooking() {
    const guestId = document.getElementById('bookingGuest').value;
    const roomId = document.getElementById('bookingRoom').value;
    const check_in_date = document.getElementById('bookingCheckin').value;
    const check_out_date = document.getElementById('bookingCheckout').value;
    
    if (!guestId || !roomId || !check_in_date || !check_out_date) {
      alert('Please fill all fields');
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: Number(guestId), room_id: Number(roomId), check_in_date, check_out_date })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');
      alert('Booking created successfully!');
      clearForm();
      toggleForm();
      loadBookings();
    } catch (e) {
      alert(e.message);
    }
  }
  
  function editBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      // TODO: Implement edit mode
      alert('Edit booking functionality - implement with MySQL UPDATE query');
    }
  }
  
  async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');
      alert('Booking cancelled successfully!');
      loadBookings();
    } catch (e) {
      alert(e.message);
    }
  }
  
  function clearForm() {
    document.getElementById('bookingGuest').value = '';
    document.getElementById('bookingRoom').value = '';
    document.getElementById('bookingCheckin').value = '';
    document.getElementById('bookingCheckout').value = '';
  }

  async function populateFormOptions() {
    // Populate guests
    try {
      const gres = await fetch('/api/guests');
      const guests = await gres.json();
      const guestSelect = document.getElementById('bookingGuest');
      guestSelect.innerHTML = '<option value="">Select Guest</option>' + guests.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    } catch {}
    // Populate rooms (available only)
    try {
      const rres = await fetch('/api/rooms');
      const rooms = await rres.json();
      const roomSelect = document.getElementById('bookingRoom');
      roomSelect.innerHTML = '<option value="">Select Room</option>' + rooms.filter(r => r.status === 'Available').map(r => `<option value="${r.id}">Room ${r.room_number} - ${r.room_type} (₹${r.price})</option>`).join('');
    } catch {}
  }