require("dotenv").config() // Load .env file
const mysql = require("mysql2")
const cors = require("cors")
const bodyParser = require("body-parser")
const PORT = process.env.PORT
const express = require("express") // init express server
const app = express()

// use cors middleware
app.use(cors())

// MySQL Configuration
const HOST = process.env.DB_HOST
const DBUSERNAME = process.env.DB_USER
const DBPW = process.env.DB_PASSWORD
const DATABASE = process.env.DB_NAME

// MySQL Connection
const db = mysql.createConnection({
  host: HOST,
  user: DBUSERNAME,
  password: DBPW,
  database: DATABASE,
})

db.connect((err) => {
  if (err) return console.error(err.message)

  console.log(`Connected to the Database!`)
})

/////////////////////
//    ROUTES       //
/////////////////////

// GET All Users
app.get("/api/users", (req, res) => {
  // console.log("Endpoint: All Users")

  // query
  const query = "SELECT username FROM users ORDER BY username ASC"

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err.stack)
      res.status(500).send("Server error")
      return
    }
    res.json(results)
  })
})

// GET All Posts
app.get("/api/posts", (req, res) => {
  // console.log("Endpoint: All Posts")

  // query
  const query = "SELECT * FROM posts ORDER BY id DESC"

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err.stack)
      res.status(500).send("Server error")
      return
    }
    res.json(results)
  })
})

app.listen(PORT, () => {
  console.log(`Node.js server running at http://localhost:${PORT}`)
})
