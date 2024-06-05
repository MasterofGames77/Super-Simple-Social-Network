require("dotenv").config() // Load .env file
const mysql = require("mysql2")
const bodyParser = require("body-parser")
const PORT = process.env.PORT

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

// init express server
const express = require("express")
const app = express()

// Route - Users
app.get("/users", (req, res) => {
  console.log("API: All Users")

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

app.listen(PORT, () => {
  console.log(`Node.js server running at http://localhost:${PORT}`)
})
