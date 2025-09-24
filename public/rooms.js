let rooms = [];
let isEditMode = false;
let editingRoomId = null;

// Load rooms when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadRooms();
});

// Fetch rooms from backend
async function loadRooms() {
  try {
    console.log('Loading rooms...');
    const response = await fetch('/api/rooms');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    rooms = await response.json();
    console.log(`Loaded ${rooms.length} rooms`);
    displayRooms();
  } catch (error) {
    console.error('Error loading rooms:', error);
    showError('Failed to load rooms: ' + error.message);
    displayRooms(); // Still show empty table with error message
  }
}

// Display rooms in table
function displayRooms() {
  const tbody = document.querySelector('#roomsTable tbody');
  tbody.innerHTML = '';

  if (rooms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">No rooms found</td></tr>';
    return;
  }

  rooms.forEach(room => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${room.room_number}</td>
      <td>${room.room_type}</td>
      <td>₹${Number(room.price).toLocaleString()}</td>
      <td><span class="status ${room.status.toLowerCase()}">${room.status}</span></td>
      <td>
        <button class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-right: 0.5rem;" onclick="editRoom(${room.id})">Edit</button>
        <button class="btn btn-danger" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;" onclick="deleteRoom(${room.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Toggle add/edit form
function toggleForm() {
  const form = document.getElementById('roomForm');
  form.classList.toggle('active');
  
  if (form.classList.contains('active')) {
    // Focus on first input when form opens
    document.getElementById('roomNumber').focus();
  } else {
    // Reset form when closing
    resetForm();
  }
}

// Reset form to add mode
function resetForm() {
  isEditMode = false;
  editingRoomId = null;
  
  document.getElementById('roomNumber').value = '';
  document.getElementById('roomType').value = '';
  document.getElementById('roomPrice').value = '';
  document.getElementById('roomStatus').value = 'Available';

  const formTitle = document.querySelector('#roomForm h3');
  const submitBtn = document.querySelector('#roomForm .btn:first-of-type');
  
  formTitle.textContent = 'Add New Room';
  submitBtn.textContent = 'Add Room';
  submitBtn.onclick = addRoom;
  
  // Remove any error messages
  clearError();
}

// Add room
async function addRoom() {
  const roomData = {
    room_number: document.getElementById('roomNumber').value.trim(),
    room_type: document.getElementById('roomType').value,
    price: parseFloat(document.getElementById('roomPrice').value),
    status: document.getElementById('roomStatus').value
  };

  // Validate input
  if (!roomData.room_number || !roomData.room_type || !roomData.price || !roomData.status) {
    showError('Please fill all fields');
    return;
  }
  
  if (isNaN(roomData.price) || roomData.price <= 0) {
    showError('Please enter a valid price');
    return;
  }

  try {
    console.log('Creating room:', roomData);
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    showSuccess('Room added successfully!');
    resetForm();
    toggleForm();
    await loadRooms(); // Reload rooms list
  } catch (error) {
    console.error('Error adding room:', error);
    showError('Error adding room: ' + error.message);
  }
}

// Edit room - populate form
function editRoom(id) {
  const room = rooms.find(r => r.id === id);
  if (!room) {
    showError('Room not found');
    return;
  }

  isEditMode = true;
  editingRoomId = id;

  // Populate form
  document.getElementById('roomNumber').value = room.room_number;
  document.getElementById('roomType').value = room.room_type;
  document.getElementById('roomPrice').value = room.price;
  document.getElementById('roomStatus').value = room.status;

  // Update form UI
  const formTitle = document.querySelector('#roomForm h3');
  const submitBtn = document.querySelector('#roomForm .btn:first-of-type');
  
  formTitle.textContent = 'Edit Room';
  submitBtn.textContent = 'Update Room';
  submitBtn.onclick = updateRoom;

  // Show form
  const form = document.getElementById('roomForm');
  if (!form.classList.contains('active')) {
    toggleForm();
  }
  
  clearError();
}

// Update room
async function updateRoom() {
  if (!editingRoomId) {
    showError('No room selected for editing');
    return;
  }

  const roomData = {
    room_number: document.getElementById('roomNumber').value.trim(),
    room_type: document.getElementById('roomType').value,
    price: parseFloat(document.getElementById('roomPrice').value),
    status: document.getElementById('roomStatus').value
  };

  // Validate input
  if (!roomData.room_number || !roomData.room_type || !roomData.price || !roomData.status) {
    showError('Please fill all fields');
    return;
  }
  
  if (isNaN(roomData.price) || roomData.price <= 0) {
    showError('Please enter a valid price');
    return;
  }

  try {
    console.log('Updating room:', editingRoomId, roomData);
    const response = await fetch(`/api/rooms/${editingRoomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    showSuccess('Room updated successfully!');
    resetForm();
    toggleForm();
    await loadRooms(); // Reload rooms list
  } catch (error) {
    console.error('Error updating room:', error);
    showError('Error updating room: ' + error.message);
  }
}

// Delete room
async function deleteRoom(id) {
  const room = rooms.find(r => r.id === id);
  if (!room) {
    showError('Room not found');
    return;
  }

  if (!confirm(`Are you sure you want to delete Room ${room.room_number}?`)) {
    return;
  }

  try {
    console.log('Deleting room:', id);
    const response = await fetch(`/api/rooms/${id}`, { 
      method: 'DELETE' 
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    showSuccess('Room deleted successfully!');
    await loadRooms(); // Reload rooms list
  } catch (error) {
    console.error('Error deleting room:', error);
    showError('Error deleting room: ' + error.message);
  }
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
  
  const form = document.getElementById('roomForm');
  if (form.classList.contains('active')) {
    form.insertBefore(errorDiv, form.firstChild);
  } else {
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(errorDiv, mainContent.firstChild);
  }
  
  // Auto-remove after 5 seconds
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
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 3000);
}

function clearError() {
  const existingErrors = document.querySelectorAll('.error-message, .success-message');
  existingErrors.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
}

// Handle form submission on Enter key
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('roomForm');
  if (form) {
    form.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isEditMode) {
          updateRoom();
        } else {
          addRoom();
        }
      }
    });
  }
});