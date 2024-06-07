require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
  
    connection.query("SELECT * FROM users", (err, results) => {
      if (err) throw err;
  
      results.forEach(user => {
        const hashedPassword = bcrypt.hashSync(user.password, 8);
        connection.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, user.id],
          (err) => {
            if (err) throw err;
            console.log(`Updated password for user ${user.username}`);
          }
        );
      });
    });
});

// User registration
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    console.log("Hashed Password:", hashedPassword); // Debugging: Log hashed password
  
    connection.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
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
  
      const passwordIsValid = bcrypt.compareSync(password, user.password);
      console.log("Password is valid:", passwordIsValid); // Debugging: Log result of password comparison
  
      if (!passwordIsValid) {
        console.log("Password is incorrect for user:", username);
        return res.status(401).send("Password is incorrect.");
      }
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 86400 });
  
      res.status(200).send({ auth: true, token });
    });
});

// Create a new post
app.post("/posts", (req, res) => {
  const token = req.headers["x-access-token"];
  if (!token) return res.status(401).send("No token provided.");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).send("Failed to authenticate token.");

    const { content } = req.body;
    connection.query("INSERT INTO posts (user_id, content, likes, dislikes) VALUES (?, ?, 0, 0)", [decoded.id, content], (err) => {
      if (err) return res.status(500).send("Error creating post");
      res.status(200).send("Post created");
    });
  });
});

// List all posts
app.get("/posts", (req, res) => {
  connection.query("SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id", (err, results) => {
    if (err) return res.status(500).send("Error retrieving posts");
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

// Like/Dislike a post
app.post("/posts/:id/interact", (req, res) => {
  const postId = req.params.id;
  const { type } = req.body;

  if (type !== "like" && type !== "dislike") return res.status(400).send("Invalid interaction type");

  const column = type === "like" ? "likes" : "dislikes";
  connection.query(`UPDATE posts SET ${column} = ${column} + 1 WHERE id = ?`, [postId], (err) => {
    if (err) return res.status(500).send("Error interacting with post");
    res.status(200).send("Interaction recorded");
  });
});

// Get likes and dislikes for a post
app.get("/posts/:id/interactions", (req, res) => {
  const postId = req.params.id;

  connection.query("SELECT likes, dislikes FROM posts WHERE id = ?", [postId], (err, results) => {
    if (err) return res.status(500).send("Error retrieving interactions");
    res.status(200).send(results[0]);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});