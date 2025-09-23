// Dummy room data
const rooms = [
    { room_number: "101", type: "Deluxe", price: 2500, status: "Available" },
    { room_number: "102", type: "Standard", price: 1500, status: "Booked" },
    { room_number: "103", type: "Suite", price: 4000, status: "Available" }
  ];
  
  const tableBody = document.querySelector("#roomsTable tbody");
  
  rooms.forEach(room => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${room.room_number}</td>
      <td>${room.type}</td>
      <td>₹${room.price}</td>
      <td>${room.status}</td>
    `;
    tableBody.appendChild(row);
  });
  