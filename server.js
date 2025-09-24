const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Database configuration for XAMPP
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Default XAMPP password is empty
  database: "hotel_db",
  port: 3306, // Default MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool instead of single connection
const db = mysql.createPool(dbConfig);


// Connect to database with error handling
db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err.message);
    console.log("Please ensure:");
    console.log("1. XAMPP MySQL is running");
    console.log("2. Database 'hotel_db' exists");
    console.log("3. Run the SQL schema in phpMyAdmin");
    process.exit(1);
  }
  console.log("✅ MySQL connected successfully!");
  console.log("🚀 Database: hotel_db");
});

// Handle database connection errors
db.on('error', (err) => {
  console.error('Database error:', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect...');
    // Handle reconnection logic here if needed
  }
});

// =============================================================================
// ROOMS API ENDPOINTS
// =============================================================================

// GET all rooms
app.get("/api/rooms", (req, res) => {
  const sql = "SELECT id, room_number, room_type, price, status FROM rooms ORDER BY room_number";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching rooms:", err);
      return res.status(500).json({ error: "Failed to fetch rooms", details: err.message });
    }
    console.log(`✅ Fetched ${results.length} rooms`);
    res.json(results);
  });
});

// CREATE a room
app.post("/api/rooms", (req, res) => {
  const { room_number, room_type, price, status } = req.body;
  
  if (!room_number || !room_type || price == null || !status) {
    return res.status(400).json({ error: "Missing required fields: room_number, room_type, price, status" });
  }

  // Validate room_type
  const validTypes = ['Standard', 'Deluxe', 'Suite', 'Presidential'];
  if (!validTypes.includes(room_type)) {
    return res.status(400).json({ error: "Invalid room_type. Must be: " + validTypes.join(', ') });
  }

  // Validate status
  const validStatuses = ['Available', 'Booked', 'Maintenance'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be: " + validStatuses.join(', ') });
  }

  const sql = "INSERT INTO rooms (room_number, room_type, price, status) VALUES (?, ?, ?, ?)";
  db.query(sql, [room_number, room_type, price, status], (err, result) => {
    if (err) {
      console.error("Error adding room:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Room number already exists" });
      }
      return res.status(500).json({ error: "Failed to add room", details: err.message });
    }
    
    const created = { id: result.insertId, room_number, room_type, price, status };
    console.log(`✅ Created room: ${room_number}`);
    res.status(201).json(created);
  });
});

// UPDATE a room
app.put("/api/rooms/:id", (req, res) => {
  const { id } = req.params;
  const { room_number, room_type, price, status } = req.body;
  
  if (!room_number || !room_type || price == null || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = "UPDATE rooms SET room_number = ?, room_type = ?, price = ?, status = ? WHERE id = ?";
  db.query(sql, [room_number, room_type, price, status, id], (err, result) => {
    if (err) {
      console.error("Error updating room:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Room number already exists" });
      }
      return res.status(500).json({ error: "Failed to update room", details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    console.log(`✅ Updated room ID: ${id}`);
    res.json({ id: Number(id), room_number, room_type, price, status });
  });
});

// DELETE a room
app.delete("/api/rooms/:id", (req, res) => {
  const { id } = req.params;
  
  // First check if room has active bookings
  const checkBookingsSql = "SELECT COUNT(*) as count FROM bookings WHERE room_id = ? AND status IN ('Confirmed', 'Pending')";
  db.query(checkBookingsSql, [id], (err, results) => {
    if (err) {
      console.error("Error checking bookings:", err);
      return res.status(500).json({ error: "Failed to check room bookings" });
    }
    
    if (results[0].count > 0) {
      return res.status(409).json({ error: "Cannot delete room with active bookings" });
    }
    
    const sql = "DELETE FROM rooms WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error deleting room:", err);
        return res.status(500).json({ error: "Failed to delete room", details: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      console.log(`✅ Deleted room ID: ${id}`);
      res.json({ success: true });
    });
  });
});

// =============================================================================
// GUESTS API ENDPOINTS  
// =============================================================================

// GET all guests
app.get("/api/guests", (req, res) => {
  const sql = "SELECT id, name, email, phone, check_in_date FROM guests ORDER BY name";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching guests:", err);
      return res.status(500).json({ error: "Failed to fetch guests", details: err.message });
    }
    console.log(`✅ Fetched ${results.length} guests`);
    res.json(results);
  });
});

// CREATE a guest
app.post("/api/guests", (req, res) => {
  const { name, email, phone, check_in_date, address } = req.body;
  
  if (!name || !email || !phone || !check_in_date) {
    return res.status(400).json({ error: "Missing required fields: name, email, phone, check_in_date" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const sql = "INSERT INTO guests (name, email, phone, check_in_date, address) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, email, phone, check_in_date, address || null], (err, result) => {
    if (err) {
      console.error("Error adding guest:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Guest with this email already exists" });
      }
      return res.status(500).json({ error: "Failed to add guest", details: err.message });
    }
    
    console.log(`✅ Created guest: ${name}`);
    res.status(201).json({ id: result.insertId, name, email, phone, check_in_date, address });
  });
});

// DELETE a guest
app.delete("/api/guests/:id", (req, res) => {
  const { id } = req.params;
  
  // First check if guest has active bookings
  const checkBookingsSql = "SELECT COUNT(*) as count FROM bookings WHERE guest_id = ? AND status IN ('Confirmed', 'Pending')";
  db.query(checkBookingsSql, [id], (err, results) => {
    if (err) {
      console.error("Error checking bookings:", err);
      return res.status(500).json({ error: "Failed to check guest bookings" });
    }
    
    if (results[0].count > 0) {
      return res.status(409).json({ error: "Cannot delete guest with active bookings" });
    }
    
    const sql = "DELETE FROM guests WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error deleting guest:", err);
        return res.status(500).json({ error: "Failed to delete guest", details: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Guest not found" });
      }
      
      console.log(`✅ Deleted guest ID: ${id}`);
      res.json({ success: true });
    });
  });
});

// =============================================================================
// BOOKINGS API ENDPOINTS
// =============================================================================

// GET all bookings using the view
app.get("/api/bookings", (req, res) => {
  const sql = `
    SELECT 
      booking_id AS id,
      guest_name,
      room_number AS room_no,
      check_in_date AS checkin,
      check_out_date AS checkout,
      total_amount AS amount,
      status
    FROM room_booking_details
    ORDER BY booking_id DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({ error: "Failed to fetch bookings", details: err.message });
    }
    console.log(`✅ Fetched ${results.length} bookings`);
    res.json(results);
  });
});

// CREATE a booking
app.post("/api/bookings", (req, res) => {
  const { guest_id, room_id, check_in_date, check_out_date } = req.body;
  
  if (!guest_id || !room_id || !check_in_date || !check_out_date) {
    return res.status(400).json({ error: "Missing required fields: guest_id, room_id, check_in_date, check_out_date" });
  }

  // Validate dates
  const checkIn = new Date(check_in_date);
  const checkOut = new Date(check_out_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    return res.status(400).json({ error: "Check-in date cannot be in the past" });
  }
  if (checkOut <= checkIn) {
    return res.status(400).json({ error: "Check-out date must be after check-in date" });
  }

  // Check if room is available
  const checkRoomSql = "SELECT price, status FROM rooms WHERE id = ?";
  db.query(checkRoomSql, [room_id], (err, roomRows) => {
    if (err) {
      console.error("Error checking room:", err);
      return res.status(500).json({ error: "Failed to check room availability" });
    }
    if (roomRows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (roomRows[0].status !== 'Available') {
      return res.status(409).json({ error: "Room is not available for booking" });
    }

    const price = Number(roomRows[0].price);
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    const total_amount = nights * price;

    // Create booking
    const insertSql = "INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, total_amount, status) VALUES (?, ?, ?, ?, ?, 'Confirmed')";
    db.query(insertSql, [guest_id, room_id, check_in_date, check_out_date, total_amount], (err, result) => {
      if (err) {
        console.error("Error creating booking:", err);
        return res.status(500).json({ error: "Failed to create booking", details: err.message });
      }

      // Update room status to Booked
      const updateRoomSql = "UPDATE rooms SET status = 'Booked' WHERE id = ?";
      db.query(updateRoomSql, [room_id], (err) => {
        if (err) {
          console.error("Error updating room status:", err);
          // Booking created but room status not updated - log warning
        }
        
        console.log(`✅ Created booking ID: ${result.insertId}`);
        res.status(201).json({ 
          id: result.insertId, 
          guest_id, 
          room_id, 
          check_in_date, 
          check_out_date, 
          total_amount, 
          status: 'Confirmed' 
        });
      });
    });
  });
});

// CANCEL a booking
app.put("/api/bookings/:id/cancel", (req, res) => {
  const { id } = req.params;
  
  // Get booking details
  const getSql = "SELECT room_id, status FROM bookings WHERE id = ?";
  db.query(getSql, [id], (err, rows) => {
    if (err) {
      console.error("Error fetching booking:", err);
      return res.status(500).json({ error: "Failed to fetch booking", details: err.message });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (rows[0].status === 'Cancelled') {
      return res.status(409).json({ error: "Booking is already cancelled" });
    }

    const roomId = rows[0].room_id;
    
    // Cancel booking
    const updateBookingSql = "UPDATE bookings SET status = 'Cancelled' WHERE id = ?";
    db.query(updateBookingSql, [id], (err) => {
      if (err) {
        console.error("Error cancelling booking:", err);
        return res.status(500).json({ error: "Failed to cancel booking", details: err.message });
      }

      // Update room status back to Available
      const updateRoomSql = "UPDATE rooms SET status = 'Available' WHERE id = ?";
      db.query(updateRoomSql, [roomId], (err) => {
        if (err) {
          console.error("Error updating room status:", err);
          // Still return success for cancellation
        }
        
        console.log(`✅ Cancelled booking ID: ${id}`);
        res.json({ success: true, message: "Booking cancelled successfully" });
      });
    });
  });
});

// =============================================================================
// DASHBOARD STATS ENDPOINT
// =============================================================================

app.get("/api/stats", (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM rooms) AS totalRooms,
      (SELECT COUNT(*) FROM rooms WHERE status = 'Available') AS availableRooms,
      (SELECT COUNT(*) FROM rooms WHERE status = 'Booked') AS bookedRooms,
      (SELECT COUNT(*) FROM guests) AS totalGuests`;
  
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Error fetching stats:", err);
      return res.status(500).json({ error: "Failed to fetch stats", details: err.message });
    }
    
    const stats = rows[0] || { totalRooms: 0, availableRooms: 0, bookedRooms: 0, totalGuests: 0 };
    console.log("✅ Fetched dashboard stats");
    res.json(stats);
  });
});

// =============================================================================
// SERVE FRONTEND
// =============================================================================

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("🏨 Hotel Management System Started");
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log("📊 Available endpoints:");
  console.log("   GET  / - Dashboard");
  console.log("   GET  /api/rooms - List all rooms");
  console.log("   POST /api/rooms - Create room");
  console.log("   PUT  /api/rooms/:id - Update room");
  console.log("   DELETE /api/rooms/:id - Delete room");
  console.log("   GET  /api/guests - List all guests");
  console.log("   POST /api/guests - Create guest");
  console.log("   DELETE /api/guests/:id - Delete guest");
  console.log("   GET  /api/bookings - List all bookings");
  console.log("   POST /api/bookings - Create booking");
  console.log("   PUT  /api/bookings/:id/cancel - Cancel booking");
  console.log("   GET  /api/stats - Dashboard statistics");
});