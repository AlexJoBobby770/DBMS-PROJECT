let rooms = [];

// Load rooms when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadRooms();
});

// Fetch rooms from backend
async function loadRooms() {
  try {
    const response = await fetch('/api/rooms');
    if (!response.ok) throw new Error('Failed to fetch rooms');

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
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No rooms found</td></tr>';
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
        <button onclick="editRoom(${room.id})">Edit</button>
        <button onclick="deleteRoom(${room.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Toggle add/edit form
function toggleForm() {
  const form = document.getElementById('roomForm');
  form.classList.toggle('active');
}

// Clear form
function clearForm() {
  document.getElementById('roomNumber').value = '';
  document.getElementById('roomType').value = '';
  document.getElementById('roomPrice').value = '';
  document.getElementById('roomStatus').value = 'Available';

  const addButton = document.querySelector('#roomForm .btn');
  addButton.textContent = 'Add Room';
  addButton.onclick = addRoom;
}

// Add room
async function addRoom() {
  const roomData = {
    room_number: document.getElementById('roomNumber').value,
    room_type: document.getElementById('roomType').value,
    price: parseFloat(document.getElementById('roomPrice').value),
    status: document.getElementById('roomStatus').value
  };

  if (!roomData.room_number || !roomData.room_type || !roomData.price || !roomData.status) {
    alert('Please fill all fields');
    return;
  }

  try {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to add room');

    alert('Room added successfully!');
    clearForm();
    toggleForm();
    loadRooms();
  } catch (error) {
    console.error('Error adding room:', error);
    alert('Error: ' + error.message);
  }
}

// Edit room
function editRoom(id) {
  const room = rooms.find(r => r.id === id);
  if (!room) return;

  document.getElementById('roomNumber').value = room.room_number;
  document.getElementById('roomType').value = room.room_type;
  document.getElementById('roomPrice').value = room.price;
  document.getElementById('roomStatus').value = room.status;

  toggleForm();

  const addButton = document.querySelector('#roomForm .btn');
  addButton.textContent = 'Update Room';
  addButton.onclick = () => updateRoom(id);
}

// Update room
async function updateRoom(id) {
  const roomData = {
    room_number: document.getElementById('roomNumber').value,
    room_type: document.getElementById('roomType').value,
    price: parseFloat(document.getElementById('roomPrice').value),
    status: document.getElementById('roomStatus').value
  };

  if (!roomData.room_number || !roomData.room_type || !roomData.price || !roomData.status) {
    alert('Please fill all fields');
    return;
  }

  try {
    const response = await fetch(`/api/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to update room');

    alert('Room updated successfully!');
    clearForm();
    toggleForm();
    loadRooms();
  } catch (error) {
    console.error('Error updating room:', error);
    alert('Error: ' + error.message);
  }
}

// Delete room
async function deleteRoom(id) {
  if (!confirm('Are you sure you want to delete this room?')) return;

  try {
    const response = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to delete room');

    alert('Room deleted successfully!');
    loadRooms();
  } catch (error) {
    console.error('Error deleting room:', error);
    alert('Error: ' + error.message);
  }
}
