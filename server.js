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

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
