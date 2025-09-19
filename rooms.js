// Sample room data - replace with API calls to your MySQL backend
let rooms = [
    { id: 1, room_number: "101", type: "Deluxe", price: 2500, status: "Available" },
    { id: 2, room_number: "102", type: "Standard", price: 1500, status: "Booked" },
    { id: 3, room_number: "103", type: "Suite", price: 4000, status: "Available" },
    { id: 4, room_number: "201", type: "Standard", price: 1500, status: "Maintenance" },
    { id: 5, room_number: "202", type: "Deluxe", price: 2500, status: "Available" }
  ];
  
  // Load rooms when page loads
  document.addEventListener('DOMContentLoaded', function() {
    loadRooms();
  });
  
  function loadRooms() {
    const tbody = document.querySelector('#roomsTable tbody');
    tbody.innerHTML = '';
    
    rooms.forEach(room => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${room.room_number}</td>
        <td>${room.type}</td>
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
  
  function addRoom() {
    const roomNumber = document.getElementById('roomNumber').value;
    const roomType = document.getElementById('roomType').value;
    const roomPrice = document.getElementById('roomPrice').value;
    const roomStatus = document.getElementById('roomStatus').value;
    
    if (!roomNumber || !roomType || !roomPrice || !roomStatus) {
      alert('Please fill all fields');
      return;
    }
    
    // Check if room number already exists
    if (rooms.find(room => room.room_number === roomNumber)) {
      alert('Room number already exists!');
      return;
    }
    
    const newRoom = {
      id: Math.max(...rooms.map(r => r.id)) + 1,
      room_number: roomNumber,
      type: roomType,
      price: parseInt(roomPrice),
      status: roomStatus
    };
    
    // TODO: Replace with API call to your MySQL backend
    // fetch('/api/rooms', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newRoom)
    // });
    
    rooms.push(newRoom);
    loadRooms();
    toggleForm();
    clearForm();
    
    alert('Room added successfully!');
  }
  
  function editRoom(id) {
    const room = rooms.find(r => r.id === id);
    if (room) {
      // Pre-fill form with existing data
      document.getElementById('roomNumber').value = room.room_number;
      document.getElementById('roomType').value = room.type;
      document.getElementById('roomPrice').value = room.price;
      document.getElementById('roomStatus').value = room.status;
      
      toggleForm();
      
      // TODO: Implement edit mode
      alert('Edit functionality - implement with MySQL UPDATE query');
    }
  }
  
  function deleteRoom(id) {
    if (confirm('Are you sure you want to delete this room?')) {
      // TODO: Replace with API call to delete from MySQL
      // fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      
      rooms = rooms.filter(room => room.id !== id);
      loadRooms();
      alert('Room deleted successfully!');
    }
  }
  
  function clearForm() {
    document.getElementById('roomNumber').value = '';
    document.getElementById('roomType').value = '';
    document.getElementById('roomPrice').value = '';
    document.getElementById('roomStatus').value = 'Available';
  }