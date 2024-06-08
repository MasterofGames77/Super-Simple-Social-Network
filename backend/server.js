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
  connection.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err) => {
    if (err) {
      console.error("Error registering user:", err);
      return res.status(500).send("Error registering user");
    }
    res.status(200).send("User registered");
  });
});

// User login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  connection.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
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
  });
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
  connection.query("SELECT * FROM posts WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.status(500).send("Error retrieving posts");
    res.status(200).send(results);
  });
});

// Create a post
app.post("/posts", (req, res) => {
  const { user_id, content } = req.body;
  connection.query("INSERT INTO posts (user_id, content, likes, dislikes) VALUES (?, ?, 0, 0)", [user_id, content], (err) => {
    if (err) {
      console.error("Error creating post:", err);
      return res.status(500).send("Error creating post");
    }
    res.status(200).send("Post created");
  });
});

// Like a post
app.post("/posts/:id/like", (req, res) => {
  const postId = req.params.id;
  connection.query("UPDATE posts SET likes = likes + 1 WHERE id = ?", [postId], (err) => {
    if (err) {
      console.error("Error liking post:", err);
      return res.status(500).send("Error liking post");
    }
    res.status(200).send("Post liked");
  });
});

// Dislike a post
app.post("/posts/:id/dislike", (req, res) => {
  const postId = req.params.id;
  connection.query("UPDATE posts SET dislikes = dislikes + 1 WHERE id = ?", [postId], (err) => {
    if (err) {
      console.error("Error disliking post:", err);
      return res.status(500).send("Error disliking post");
    }
    res.status(200).send("Post disliked");
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});