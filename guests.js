// Sample guest data - replace with API calls to your MySQL backend
let guests = [
    { id: 1, name: "John Doe", email: "john@email.com", phone: "+91-9876543210", checkin: "2024-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@email.com", phone: "+91-9876543211", checkin: "2024-01-16" },
    { id: 3, name: "Mike Johnson", email: "mike@email.com", phone: "+91-9876543212", checkin: "2024-01-17" },
    { id: 4, name: "Sarah Wilson", email: "sarah@email.com", phone: "+91-9876543213", checkin: "2024-01-18" }
  ];
  
  // Load guests when page loads
  document.addEventListener('DOMContentLoaded', function() {
    loadGuests();
  });
  
  function loadGuests() {
    const tbody = document.querySelector('#guestsTable tbody');
    tbody.innerHTML = '';
    
    guests.forEach(guest => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${guest.id}</td>
        <td>${guest.name}</td>
        <td>${guest.email}</td>
        <td>${guest.phone}</td>
        <td>${guest.checkin}</td>
        <td>
          <button class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-right: 0.5rem;" onclick="editGuest(${guest.id})">Edit</button>
          <button class="btn btn-danger" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;" onclick="deleteGuest(${guest.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
  
  function toggleForm() {
    const form = document.getElementById('guestForm');
    form.classList.toggle('active');
  }
  
  function addGuest() {
    const name = document.getElementById('guestName').value;
    const email = document.getElementById('guestEmail').value;
    const phone = document.getElementById('guestPhone').value;
    const checkin = document.getElementById('guestCheckin').value;
    
    if (!name || !email || !phone || !checkin) {
      alert('Please fill all fields');
      return;
    }
    
    // Check if email already exists
    if (guests.find(guest => guest.email === email)) {
      alert('Guest with this email already exists!');
      return;
    }
    
    const newGuest = {
      id: Math.max(...guests.map(g => g.id)) + 1,
      name: name,
      email: email,
      phone: phone,
      checkin: checkin
    };
    
    // TODO: Replace with API call to your MySQL backend
    // fetch('/api/guests', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newGuest)
    // });
    
    guests.push(newGuest);
    loadGuests();
    toggleForm();
    clearForm();
    
    alert('Guest added successfully!');
  }
  
  function editGuest(id) {
    const guest = guests.find(g => g.id === id);
    if (guest) {
      // Pre-fill form with existing data
      document.getElementById('guestName').value = guest.name;
      document.getElementById('guestEmail').value = guest.email;
      document.getElementById('guestPhone').value = guest.phone;
      document.getElementById('guestCheckin').value = guest.checkin;
      
      toggleForm();
      
      // TODO: Implement edit mode
      alert('Edit functionality - implement with MySQL UPDATE query');
    }
  }
  
  function deleteGuest(id) {
    if (confirm('Are you sure you want to delete this guest?')) {
      // TODO: Replace with API call to delete from MySQL
      // fetch(`/api/guests/${id}`, { method: 'DELETE' });
      
      guests = guests.filter(guest => guest.id !== id);
      loadGuests();
      alert('Guest deleted successfully!');
    }
  }
  
  function clearForm() {
    document.getElementById('guestName').value = '';
    document.getElementById('guestEmail').value = '';
    document.getElementById('guestPhone').value = '';
    document.getElementById('guestCheckin').value = '';
  }