let guests = [];

// Load guests when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadGuests();
});

async function loadGuests() {
  try {
    console.log('Loading guests...');
    const res = await fetch('/api/guests');
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    guests = await res.json();
    console.log(`Loaded ${guests.length} guests`);
    displayGuests();
  } catch (e) {
    console.error('Error loading guests', e);
    showError('Failed to load guests: ' + e.message);
    guests = [];
    displayGuests();
  }
}

function displayGuests() {
  const tbody = document.querySelector('#guestsTable tbody');
  tbody.innerHTML = '';
  
  if (guests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#999;">No guests found</td></tr>';
    return;
  }

  guests.forEach(guest => {
    const row = document.createElement('tr');
    const checkinDate = guest.check_in_date ? new Date(guest.check_in_date).toLocaleDateString('en-IN') : '';
    
    row.innerHTML = `
      <td>${guest.id}</td>
      <td>${guest.name}</td>
      <td>${guest.email}</td>
      <td>${guest.phone}</td>
      <td>${checkinDate}</td>
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
  
  if (form.classList.contains('active')) {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('guestCheckin').min = today;
    
    // Focus on first input
    document.getElementById('guestName').focus();
    clearError();
  } else {
    clearForm();
  }
}

async function addGuest() {
  const name = document.getElementById('guestName').value.trim();
  const email = document.getElementById('guestEmail').value.trim();
  const phone = document.getElementById('guestPhone').value.trim();
  const check_in_date = document.getElementById('guestCheckin').value;
  
  if (!name || !email || !phone || !check_in_date) {
    showError('Please fill all fields');
    return;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('Please enter a valid email address');
    return;
  }

  // Validate phone (basic validation for Indian numbers)
  const phoneRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
    showError('Please enter a valid phone number');
    return;
  }

  // Validate check-in date
  const checkinDate = new Date(check_in_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkinDate < today) {
    showError('Check-in date cannot be in the past');
    return;
  }

  try {
    console.log('Creating guest:', { name, email, phone, check_in_date });
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, check_in_date })
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    
    showSuccess('Guest added successfully!');
    clearForm();
    toggleForm();
    await loadGuests();
  } catch (e) {
    console.error('Error adding guest:', e);
    showError('Error adding guest: ' + e.message);
  }
}

function editGuest(id) {
  const guest = guests.find(g => g.id === id);
  if (guest) {
    showError('Edit guest functionality is not yet implemented. Please delete and create a new guest if changes are needed.');
  }
}

async function deleteGuest(id) {
  const guest = guests.find(g => g.id === id);
  if (!guest) {
    showError('Guest not found');
    return;
  }

  if (!confirm(`Are you sure you want to delete guest "${guest.name}"?\n\nThis will also delete all their bookings.`)) {
    return;
  }

  try {
    console.log('Deleting guest:', id);
    const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    showSuccess('Guest deleted successfully!');
    await loadGuests();
  } catch (e) {
    console.error('Error deleting guest:', e);
    showError('Error deleting guest: ' + e.message);
  }
}

function clearForm() {
  document.getElementById('guestName').value = '';
  document.getElementById('guestEmail').value = '';
  document.getElementById('guestPhone').value = '';
  document.getElementById('guestCheckin').value = '';
  clearError();
}

// Utility functions for user feedback
function showError(message) {
  clearError();
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.cssText = `
    background: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
  `;
  errorDiv.textContent = message;
  
  const form = document.getElementById('guestForm');
  if (form.classList.contains('active')) {
    form.insertBefore(errorDiv, form.firstChild);
  } else {
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(errorDiv, mainContent.firstChild);
  }
  
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 5000);
}

function showSuccess(message) {
  clearError();
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.style.cssText = `
    background: #d4edda;
    color: #155724;
    padding: 0.75rem;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
    border: 1px solid #c3e6cb;
  `;
  successDiv.textContent = message;
  
  const mainContent = document.querySelector('.main-content');
  mainContent.insertBefore(successDiv, mainContent.firstChild);
  
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 3000);
}

function clearError() {
  const existingMessages = document.querySelectorAll('.error-message, .success-message');
  existingMessages.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
}

// Format phone number as user types
document.addEventListener('DOMContentLoaded', function() {
  const phoneInput = document.getElementById('guestPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
      
      if (value.length > 0) {
        if (value.startsWith('91')) {
          value = '+91-' + value.slice(2);
        } else if (value.length === 10) {
          value = '+91-' + value;
        }
      }
      
      e.target.value = value;
    });
  }
});