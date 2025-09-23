// MySQL integrated rooms.js
let rooms = [];

// Load rooms when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadRooms();
});

// Fetch rooms from MySQL database
async function loadRooms() {
  try {
    const response = await fetch('/api/rooms');
    if (!response.ok) {
      throw new Error('Failed to fetch rooms');
    }
    
    rooms = await response.json();
    displayRooms();
  } catch (error) {
    console.error('Error loading rooms:', error);
    alert('Failed to load rooms. Please check your connection.');
  }
}

// Display rooms in table
function displayRooms() {
  const tbody = document.querySelector('#roomsTable tbody');
  tbody.innerHTML = '';
  
  if (rooms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No rooms found</td></tr>';
    return;
  }
  
  rooms.forEach(room => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${room.room_number}</td>
      <td>${room.room_type}</td>
      <td>₹${room.price}</td>
      <td><span class="status ${room.status.toLowerCase()}">${room.status}</span></td>
      <td>
        <button class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-right: 0.5rem;" onclick="editRoom(${room.id})">Edit</button>
        <button class="btn btn-danger" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;" onclick="deleteRoom(${room.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function toggleForm() {
  const form = document.getElementById('roomForm');
  form.classList.toggle('active');
}

// Add room to MySQL database
async function addRoom() {
  const roomNumber = document.getElementById('roomNumber').value;
  const roomType = document.getElementById('roomType').value;
  const roomPrice = document.getElementById('roomPrice').value;
  const roomStatus = document.getElementById('roomStatus').value;
  
  if (!roomNumber || !roomType || !roomPrice || !roomStatus) {
    alert('Please fill all fields');
    return;
  }
  
  const roomData = {
    room_number: roomNumber,
    room_type: roomType,
    price: parseFloat(roomPrice),
    status: roomStatus
  };
  
  try {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roomData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to add room');
    }
    
    alert('Room added successfully!');
    loadRooms(); // Reload data from database
    toggleForm();
    clearForm();
    
  } catch (error) {
    console.error('Error adding room:', error);
    alert('Error: ' + error.message);
  }
}

// Edit room in MySQL database
async function editRoom(id) {
  const room = rooms.find(r => r.id === id);
  if (!room) return;
  
  // Pre-fill form with existing data
  document.getElementById('roomNumber').value = room.room_number;
  document.getElementById('roomType').value = room.room_type;
  document.getElementById('roomPrice').value = room.price;
  document.getElementById('roomStatus').value = room.status;
  
  toggleForm();
  
  // Change button text and function for editing
  const addButton = document.querySelector('#roomForm .btn');
  addButton.textContent = 'Update Room';
  addButton.onclick = () => updateRoom(id);
}

// Update room in MySQL database
async function updateRoom(id) {
  const roomNumber = document.getElementById('roomNumber').value;
  const roomType = document.getElementById('roomType').value;
  const roomPrice = document.getElementById('roomPrice').value;
  const roomStatus = document.getElementById('roomStatus').value;
  
  if (!roomNumber || !roomType || !roomPrice || !roomStatus) {
    alert('Please fill all fields');
    return;
  }
  
  const roomData = {
    room_number: roomNumber,
    room_type: roomType,
    price: parseFloat(roomPrice),
    status: roomStatus
  };
  
  try {
    const response = await fetch(`/api/rooms/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roomData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update room');
    }
    
    alert('Room updated successfully!');
    loadRooms(); // Reload data from database
    toggleForm();
    clearForm();
    
    // Reset button
    const addButton = document.querySelector('#roomForm .btn');
    addButton.textContent = 'Add Room';
    addButton.onclick = addRoom;
    
  } catch (error) {
    console.error('Error updating room:', error);
    alert('Error: ' + error.message);
  }
}

// Delete room from MySQL database
async function deleteRoom(id) {
  if (!confirm('Are you sure you want to delete this room?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete room');
    }
    
    alert('Room deleted successfully!');
    loadRooms(); // Reload data from database
    
  } catch (error) {
    console.error('Error deleting room:', error);
    alert('Error: ' + error.message);
  }
}

function clearForm() {
  document.getElementById('roomNumber').value = '';
  document.getElementById('roomType').value = '';
  document.getElementById('roomPrice').value = '';
  document.getElementById('roomStatus').value = 'Available';
}