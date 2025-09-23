let guests = [];
  
  // Load guests when page loads
  document.addEventListener('DOMContentLoaded', function() {
    loadGuests();
  });
  
  async function loadGuests() {
    try {
      const res = await fetch('/api/guests');
      if (!res.ok) throw new Error('Failed to fetch guests');
      guests = await res.json();
    } catch (e) {
      console.error('Error loading guests', e);
      alert('Failed to load guests');
      guests = [];
    }

    const tbody = document.querySelector('#guestsTable tbody');
    tbody.innerHTML = '';
    guests.forEach(guest => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${guest.id}</td>
        <td>${guest.name}</td>
        <td>${guest.email}</td>
        <td>${guest.phone}</td>
        <td>${guest.check_in_date || ''}</td>
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
  
  async function addGuest() {
    const name = document.getElementById('guestName').value;
    const email = document.getElementById('guestEmail').value;
    const phone = document.getElementById('guestPhone').value;
    const check_in_date = document.getElementById('guestCheckin').value;
    
    if (!name || !email || !phone || !check_in_date) {
      alert('Please fill all fields');
      return;
    }

    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, check_in_date })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add guest');
      alert('Guest added successfully!');
      clearForm();
      toggleForm();
      loadGuests();
    } catch (e) {
      alert(e.message);
    }
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
  
  async function deleteGuest(id) {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    try {
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete guest');
      alert('Guest deleted successfully!');
      loadGuests();
    } catch (e) {
      alert(e.message);
    }
  }
  
  function clearForm() {
    document.getElementById('guestName').value = '';
    document.getElementById('guestEmail').value = '';
    document.getElementById('guestPhone').value = '';
    document.getElementById('guestCheckin').value = '';
  }