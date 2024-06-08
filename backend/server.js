// server.js
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
});

// User registration
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  connection.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    (err) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).send("Error registering user");
      }
      res.status(200).send("User registered");
    }
  );
});

// User login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Error on the server.");
      }

      if (results.length === 0) {
        console.log("No user found with username:", username);
        return res.status(404).send("No user found.");
      }

      const user = results[0];
      console.log("User found:", user); // Debugging: Log user data from DB

      if (password !== user.password) {
        console.log("Password is incorrect for user:", username);
        return res.status(401).send("Password is incorrect.");
      }

      res.status(200).send({ auth: true, user });
    }
  );
});

// List all users
app.get("/users", (req, res) => {
  connection.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).send("Error retrieving users");
    res.status(200).send(results);
  });
});

// List posts by user
app.get("/posts/user/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    "SELECT * FROM posts WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).send("Error retrieving posts");
      res.status(200).send(results);
    }
  );
});

// Interaction with posts (like/dislike)
app.post("/posts/:id/interact", (req, res) => {
  const postId = req.params.id;
  const { type } = req.body;

  connection.query(
    `UPDATE posts SET ${
      type === "like" ? "likes" : "dislikes"
    } = ${type === "like" ? "likes + 1" : "dislikes + 1"} WHERE id = ?`,
    [postId],
    (err) => {
      if (err) {
        console.error("Error interacting with post:", err);
        return res.status(500).send("Error interacting with post");
      }
      res.status(200).send("Interaction recorded successfully");
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
