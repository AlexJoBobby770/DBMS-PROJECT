// Sample booking data - replace with API calls to your MySQL backend
let bookings = [
    { id: 1, guest_name: "John Doe", room_no: "102", checkin: "2024-01-15", checkout: "2024-01-17", amount: 3000, status: "Confirmed" },
    { id: 2, guest_name: "Jane Smith", room_no: "201", checkin: "2024-01-16", checkout: "2024-01-18", amount: 3000, status: "Confirmed" },
    { id: 3, guest_name: "Mike Johnson", room_no: "103", checkin: "2024-01-20", checkout: "2024-01-23", amount: 12000, status: "Pending" }
  ];
  
  // Load bookings when page loads
  document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
  });
  
  function loadBookings() {
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
  
  function addBooking() {
    const guestId = document.getElementById('bookingGuest').value;
    const roomNo = document.getElementById('bookingRoom').value;
    const checkin = document.getElementById('bookingCheckin').value;
    const checkout = document.getElementById('bookingCheckout').value;
    
    if (!guestId || !roomNo || !checkin || !checkout) {
      alert('Please fill all fields');
      return;
    }
    
    // Calculate amount based on room price and days (simplified)
    const roomPrices = {
      '101': 2500,
      '103': 4000,
      '202': 2500
    };
    
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const days = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    const amount = roomPrices[roomNo] * days;
    
    const guestNames = {
      '1': 'John Doe',
      '2': 'Jane Smith',
      '3': 'Mike Johnson'
    };
    
    const newBooking = {
      id: Math.max(...bookings.map(b => b.id)) + 1,
      guest_name: guestNames[guestId],
      room_no: roomNo,
      checkin: checkin,
      checkout: checkout,
      amount: amount,
      status: "Confirmed"
    };
    
    // TODO: Replace with API call to your MySQL backend
    // Also need to update room status to "Booked"
    // fetch('/api/bookings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newBooking)
    // });
    
    bookings.push(newBooking);
    loadBookings();
    toggleForm();
    clearForm();
    
    alert(`Booking created successfully!\nTotal Amount: ₹${amount} for ${days} days`);
  }
  
  function editBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      // TODO: Implement edit mode
      alert('Edit booking functionality - implement with MySQL UPDATE query');
    }
  }
  
  function cancelBooking(id) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      // TODO: Replace with API call to update booking status
      // Also need to update room status back to "Available"
      
      const booking = bookings.find(b => b.id === id);
      if (booking) {
        booking.status = "Cancelled";
        loadBookings();
        alert('Booking cancelled successfully!');
      }
    }
  }
  
  function clearForm() {
    document.getElementById('bookingGuest').value = '';
    document.getElementById('bookingRoom').value = '';
    document.getElementById('bookingCheckin').value = '';
    document.getElementById('bookingCheckout').value = '';
  }