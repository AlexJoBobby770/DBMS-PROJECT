const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve frontend

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hotel_db"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL connected!");
});

app.get("/guests", (req, res) => {
  db.query("SELECT * FROM guests", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Rooms CRUD API
// GET all rooms
app.get("/api/rooms", (req, res) => {
  const sql = "SELECT id, room_number, room_type, price, status FROM rooms ORDER BY room_number";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching rooms:", err);
      return res.status(500).json({ error: "Failed to fetch rooms" });
    }
    res.json(results);
  });
});

// CREATE a room
app.post("/api/rooms", (req, res) => {
  const { room_number, room_type, price, status } = req.body;
  if (!room_number || !room_type || price == null || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = "INSERT INTO rooms (room_number, room_type, price, status) VALUES (?, ?, ?, ?)";
  db.query(sql, [room_number, room_type, price, status], (err, result) => {
    if (err) {
      console.error("Error adding room:", err);
      return res.status(500).json({ error: "Failed to add room" });
    }
    const created = { id: result.insertId, room_number, room_type, price, status };
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
      return res.status(500).json({ error: "Failed to update room" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json({ id: Number(id), room_number, room_type, price, status });
  });
});

// DELETE a room
app.delete("/api/rooms/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM rooms WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting room:", err);
      return res.status(500).json({ error: "Failed to delete room" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json({ success: true });
  });
});

// Dashboard stats
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
      return res.status(500).json({ error: "Failed to fetch stats" });
    }
    res.json(rows[0] || { totalRooms: 0, availableRooms: 0, bookedRooms: 0, totalGuests: 0 });
  });
});

// Guests API
app.get("/api/guests", (req, res) => {
  const sql = "SELECT id, name, email, phone, check_in_date FROM guests ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching guests:", err);
      return res.status(500).json({ error: "Failed to fetch guests" });
    }
    res.json(results);
  });
});

app.post("/api/guests", (req, res) => {
  const { name, email, phone, check_in_date } = req.body;
  if (!name || !email || !phone || !check_in_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const sql = "INSERT INTO guests (name, email, phone, check_in_date) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, phone, check_in_date], (err, result) => {
    if (err) {
      console.error("Error adding guest:", err);
      // Duplicate email constraint
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Guest with this email already exists" });
      }
      return res.status(500).json({ error: "Failed to add guest" });
    }
    res.status(201).json({ id: result.insertId, name, email, phone, check_in_date });
  });
});

app.delete("/api/guests/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM guests WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting guest:", err);
      return res.status(500).json({ error: "Failed to delete guest" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Guest not found" });
    }
    res.json({ success: true });
  });
});

// Bookings API (read-only list from view)
app.get("/api/bookings", (req, res) => {
  // Use the view if available, else join tables
  const sql = `
    SELECT 
      b.id AS id,
      g.name AS guest_name,
      r.room_number AS room_no,
      b.check_in_date AS checkin,
      b.check_out_date AS checkout,
      b.total_amount AS amount,
      b.status AS status
    FROM bookings b
    JOIN guests g ON b.guest_id = g.id
    JOIN rooms r ON b.room_id = r.id
    ORDER BY b.id DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({ error: "Failed to fetch bookings" });
    }
    res.json(results);
  });
});

// Create booking and mark room as Booked
app.post("/api/bookings", (req, res) => {
  const { guest_id, room_id, check_in_date, check_out_date } = req.body;
  if (!guest_id || !room_id || !check_in_date || !check_out_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // Retrieve room price, compute amount by nights, insert booking, update room status
  const getRoomSql = "SELECT price FROM rooms WHERE id = ?";
  db.query(getRoomSql, [room_id], (err, roomRows) => {
    if (err) {
      console.error("Error fetching room:", err);
      return res.status(500).json({ error: "Failed to create booking" });
    }
    if (roomRows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    const price = Number(roomRows[0].price);
    const nightsSql = "SELECT DATEDIFF(?, ?) AS nights";
    db.query(nightsSql, [check_out_date, check_in_date], (err2, nightRows) => {
      if (err2) {
        console.error("Error calculating nights:", err2);
        return res.status(500).json({ error: "Failed to create booking" });
      }
      const nights = Math.max(1, Number(nightRows[0].nights || 1));
      const total_amount = nights * price;
      const insertSql = "INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, total_amount, status) VALUES (?, ?, ?, ?, ?, 'Confirmed')";
      db.query(insertSql, [guest_id, room_id, check_in_date, check_out_date, total_amount], (err3, result) => {
        if (err3) {
          console.error("Error creating booking:", err3);
          return res.status(500).json({ error: "Failed to create booking" });
        }
        const updateRoomSql = "UPDATE rooms SET status = 'Booked' WHERE id = ?";
        db.query(updateRoomSql, [room_id], (err4) => {
          if (err4) {
            console.error("Error updating room status:", err4);
            // Booking created but status not updated; still return created
          }
          res.status(201).json({ id: result.insertId, guest_id, room_id, check_in_date, check_out_date, total_amount, status: 'Confirmed' });
        });
      });
    });
  });
});

// Cancel booking and mark room as Available
app.put("/api/bookings/:id/cancel", (req, res) => {
  const { id } = req.params;
  const getSql = "SELECT room_id FROM bookings WHERE id = ?";
  db.query(getSql, [id], (err, rows) => {
    if (err) {
      console.error("Error fetching booking:", err);
      return res.status(500).json({ error: "Failed to cancel booking" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const roomId = rows[0].room_id;
    const updBooking = "UPDATE bookings SET status = 'Cancelled' WHERE id = ?";
    db.query(updBooking, [id], (err2) => {
      if (err2) {
        console.error("Error updating booking:", err2);
        return res.status(500).json({ error: "Failed to cancel booking" });
      }
      const updRoom = "UPDATE rooms SET status = 'Available' WHERE id = ?";
      db.query(updRoom, [roomId], (err3) => {
        if (err3) {
          console.error("Error updating room status:", err3);
          // still return success for cancellation
        }
        res.json({ success: true });
      });
    });
  });
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
