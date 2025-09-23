const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
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

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
